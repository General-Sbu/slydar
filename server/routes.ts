import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { 
  insertPresentationSchema, 
  insertSlideSchema, 
  insertPresentationSessionSchema,
  insertResponseSchema,
  insertNoteSchema,
  insertFeedbackSchema,
  insertReactionSchema,
  insertQuestionSchema,
  presentationSessions,
  presentations,
  responses,
  slides
} from "@shared/schema";
import { randomBytes } from "crypto";
import multer from "multer";
import { setupAuth as setupOIDCAuth, isAuthenticated, registerAuthRoutes, getSession } from "./replit_integrations/auth";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { updateOnboardingSchema, registerSchema, loginSchema } from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, sql } from "drizzle-orm";
import { createPayFastPaymentUrl, verifyPayFastITN, validatePayFastAmount } from "./payfast";

interface SocketClient {
  sessionId?: string;
  role?: 'presenter' | 'audience';
  participantId?: string;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}


export async function registerRoutes(app: Express): Promise<Server> {
  await setupOIDCAuth(app);
  registerAuthRoutes(app);

  // Setup local strategy for username/password auth
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Local auth register endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        username: data.username,
        password: hashedPassword,
        email: data.email && data.email !== '' ? data.email : undefined,
      });

      // Return success without auto-login - user will be redirected to sign in
      res.json({ id: user.id, username: user.username, email: user.email });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  // Local auth login endpoint
  app.post('/api/auth/login', (req, res, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ message: "Invalid login data" });
    }

    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ message: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      // Create session for local auth user
      const userSession = {
        claims: { sub: user.id },
        id: user.id,
      };

      req.login(userSession, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  // Local auth logout endpoint
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session?.destroy((err: any) => {
        if (err) {
          console.error("Session destroy error:", err);
        }
        res.json({ success: true });
      });
    });
  });

  // PayFast Payment Routes
  app.post('/api/payments/initiate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { plan, email, firstName, lastName } = req.body;
      
      if (!plan || plan !== 'basic') {
        return res.status(400).json({ error: 'Invalid plan' });
      }

      const merchantId = process.env.PAYFAST_MERCHANT_ID;
      const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
      const passphrase = process.env.PAYFAST_PASSPHRASE || '';

      if (!merchantId || !merchantKey) {
        return res.status(500).json({ error: 'Payment configuration not available' });
      }

      const paymentId = `SLIDR-${userId}-${Date.now()}`;
      const amount = '199.00';

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`
        : `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;

      const paymentUrl = createPayFastPaymentUrl({
        merchant_id: merchantId,
        merchant_key: merchantKey,
        return_url: `${baseUrl}/checkout?status=success`,
        cancel_url: `${baseUrl}/checkout?status=cancelled`,
        notify_url: `${baseUrl}/api/payments/notify`,
        name_first: firstName,
        name_last: lastName,
        email_address: email,
        m_payment_id: paymentId,
        amount: amount,
        item_name: 'Slidr Basic Plan - Monthly',
        item_description: 'Monthly subscription to Slidr Basic plan',
        custom_str1: userId,
        custom_str2: 'basic',
      }, passphrase, true);

      res.json({ paymentUrl, paymentId });
    } catch (error) {
      console.error('Payment initiation error:', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  });

  // PayFast ITN (Instant Transaction Notification) endpoint
  app.post('/api/payments/notify', async (req, res) => {
    try {
      const passphrase = process.env.PAYFAST_PASSPHRASE || '';
      
      const isValid = verifyPayFastITN(req.body, passphrase);
      
      if (!isValid) {
        console.error('Invalid PayFast ITN signature');
        return res.status(400).send('Invalid signature');
      }

      const { payment_status, m_payment_id, amount_gross, custom_str1, custom_str2 } = req.body;
      const userId = custom_str1;
      const plan = custom_str2;

      if (payment_status === 'COMPLETE') {
        if (!validatePayFastAmount(amount_gross, '199.00')) {
          console.error('Amount mismatch:', amount_gross);
          return res.status(400).send('Amount mismatch');
        }

        console.log(`Payment successful for user ${userId}, plan: ${plan}, payment_id: ${m_payment_id}`);
      }

      res.status(200).send('OK');
    } catch (error) {
      console.error('ITN processing error:', error);
      res.status(500).send('Error processing notification');
    }
  });

  app.patch('/api/onboarding', isAuthenticated, async (req: any, res) => {
    try {
      const data = updateOnboardingSchema.parse(req.body);
      const userId = req.user?.claims?.sub;
      
      const updatedUser = await storage.updateUserOnboarding(userId, data);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating onboarding:", error);
      res.status(400).json({ message: "Invalid onboarding data" });
    }
  });

  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ error: "Failed to fetch template" });
    }
  });

  app.get("/api/presentations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const presentations = await storage.getPresentationsByUser(userId);
      
      const presentationsWithCounts = await Promise.all(
        presentations.map(async (presentation) => {
          const slides = await storage.getSlidesByPresentation(presentation.id);
          return {
            ...presentation,
            slideCount: slides.length
          };
        })
      );
      
      res.json(presentationsWithCounts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presentations" });
    }
  });

  app.post("/api/presentations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { firstSlideType, ...presentationData } = req.body;
      const data = insertPresentationSchema.parse({
        ...presentationData,
        userId
      });
      const presentation = await storage.createPresentation(data);
      
      // If a specific first slide type was requested (from onboarding)
      if (firstSlideType) {
        const slideTypeMap: Record<string, { type: "word_cloud" | "multiple_choice" | "open_ended" | "heading" | "image"; question: string; options?: string[]; config?: any }> = {
          word_cloud: { 
            type: "word_cloud", 
            question: "Ask your question here",
            config: {
              elements: [
                {
                  id: crypto.randomUUID(),
                  type: "text" as const,
                  x: 10,
                  y: 20,
                  width: 80,
                  content: "Ask your question here",
                  fontSize: 40,
                  fontWeight: "bold" as const,
                  textAlign: "center" as const,
                  rotation: 0,
                  zIndex: 1
                }
              ]
            }
          },
          multiple_choice: { 
            type: "multiple_choice", 
            question: "Enter the Poll Question here", 
            options: ["Option 1", "Option 2", "Option 3"],
            config: {
              elements: [
                {
                  id: crypto.randomUUID(),
                  type: "text" as const,
                  x: 10,
                  y: 15,
                  width: 80,
                  content: "Enter the Poll Question here",
                  fontSize: 36,
                  fontWeight: "bold" as const,
                  textAlign: "center" as const,
                  rotation: 0,
                  zIndex: 1
                }
              ]
            }
          },
          multiple_choice_quiz: { type: "multiple_choice", question: "Test your knowledge", options: ["Answer A", "Answer B", "Answer C"] },
          open_ended: { type: "open_ended", question: "Share your thoughts" },
        };
        
        const slideConfig = slideTypeMap[firstSlideType];
        if (slideConfig) {
          await storage.createSlide({
            presentationId: presentation.id,
            type: slideConfig.type,
            question: slideConfig.question,
            options: slideConfig.options,
            config: slideConfig.config,
            order: 0,
          });
        }
      } 
      // If a template was selected, create an initial slide with template colors and text elements
      else if (data.templateId) {
        const template = await storage.getTemplate(data.templateId);
        if (template) {
          const initialSlide = {
            presentationId: presentation.id,
            type: "heading" as const,
            question: "",
            order: 0,
            config: {
              background: template.colorScheme.background,
              textColor: template.colorScheme.text,
              elements: [
                {
                  id: crypto.randomUUID(),
                  type: "text" as const,
                  x: 10,
                  y: 20,
                  width: 80,
                  content: "Replace this with your heading",
                  fontSize: 18,
                  fontWeight: "bold" as const,
                  textAlign: "left" as const,
                  color: template.colorScheme.text,
                  rotation: 0
                },
                {
                  id: crypto.randomUUID(),
                  type: "text" as const,
                  x: 10,
                  y: 50,
                  width: 80,
                  content: "Replace this with your body text. Duplicate this text as many times as you would like.",
                  fontSize: 14,
                  fontWeight: "normal" as const,
                  textAlign: "left" as const,
                  color: template.colorScheme.text,
                  rotation: 0
                }
              ]
            }
          };
          await storage.createSlide(initialSlide);
        }
      }
      
      res.json(presentation);
    } catch (error) {
      console.error("Presentation creation error:", error);
      res.status(400).json({ error: "Invalid presentation data" });
    }
  });

  app.get("/api/presentations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(presentation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presentation" });
    }
  });

  app.patch("/api/presentations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await storage.updatePresentation(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update presentation" });
    }
  });

  app.delete("/api/presentations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const deleted = await storage.deletePresentation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete presentation" });
    }
  });

  app.patch("/api/presentations/:id/publish", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await storage.updatePresentation(req.params.id, { published: true });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to publish presentation" });
    }
  });

  app.patch("/api/presentations/:id/unpublish", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await storage.updatePresentation(req.params.id, { published: false });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to unpublish presentation" });
    }
  });

  app.get("/api/presentations/:id/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const slides = await storage.getSlidesByPresentation(req.params.id);
      const sessions = await db.select().from(presentationSessions).where(eq(presentationSessions.presentationId, req.params.id));
      
      const sessionIds = sessions.map((s: any) => s.id);
      
      const participantSet = new Set<string>();
      
      for (const sessionId of sessionIds) {
        const sessionResponses = await storage.getResponsesBySession(sessionId);
        sessionResponses.forEach(r => participantSet.add(r.participantId));
        
        const sessionFeedback = await storage.getFeedbackBySession(sessionId);
        sessionFeedback.forEach(f => participantSet.add(f.participantId));
        
        const sessionQuestions = await storage.getQuestionsBySession(sessionId);
        sessionQuestions.forEach(q => participantSet.add(q.participantId));
      }
      
      for (const slide of slides) {
        for (const sessionId of sessionIds) {
          const slideReactions = await storage.getReactionsBySlide(slide.id, sessionId);
          slideReactions.forEach(r => participantSet.add(r.participantId));
        }
      }

      const slideAnalytics = await Promise.all(slides.map(async (slide) => {
        let reactionCount = 0;
        let responseCount = 0;
        let feedbackCount = 0;
        
        for (const sessionId of sessionIds) {
          const slideReactions = await storage.getReactionsBySlide(slide.id, sessionId);
          reactionCount += slideReactions.filter(r => r.reactionType === 'like' || r.reactionType === 'heart').length;
          
          const slideResponses = await storage.getResponsesBySlide(slide.id, sessionId);
          responseCount += slideResponses.length;
          
          const slideFeedback = await storage.getFeedbackBySlide(slide.id, sessionId);
          feedbackCount += slideFeedback.length;
        }

        return {
          slideId: slide.id,
          slideTitle: slide.question || `Slide ${slide.order + 1}`,
          slideType: slide.type,
          reactions: reactionCount,
          responses: responseCount,
          feedback: feedbackCount
        };
      }));

      let totalQuestions = 0;
      for (const sessionId of sessionIds) {
        const sessionQuestions = await storage.getQuestionsBySession(sessionId);
        totalQuestions += sessionQuestions.length;
      }

      res.json({
        presentationId: presentation.id,
        presentationTitle: presentation.title,
        totalSessions: sessions.length,
        totalParticipants: participantSet.size,
        totalQuestions,
        slideAnalytics
      });
    } catch (error) {
      console.error("Analytics fetch error:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/user/sessions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      const userPresentations = await db
        .select()
        .from(presentations)
        .where(eq(presentations.userId, userId));
      
      const presentationIds = userPresentations.map(p => p.id);
      
      if (presentationIds.length === 0) {
        return res.json([]);
      }
      
      const allSessions = await db
        .select()
        .from(presentationSessions)
        .where(inArray(presentationSessions.presentationId, presentationIds));
      
      const sessionsWithDetails = await Promise.all(
        allSessions.map(async (session) => {
          const presentation = userPresentations.find(p => p.id === session.presentationId);
          
          const sessionResponses = await storage.getResponsesBySession(session.id);
          const uniqueParticipants = new Set(sessionResponses.map(r => r.participantId));
          
          return {
            id: session.id,
            presentationId: session.presentationId,
            presentationTitle: presentation?.title || 'Unknown',
            code: session.code,
            startedAt: session.startedAt,
            isActive: session.isActive,
            participantCount: uniqueParticipants.size,
            responseCount: sessionResponses.length
          };
        })
      );
      
      sessionsWithDetails.sort((a, b) => 
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
      
      res.json(sessionsWithDetails);
    } catch (error) {
      console.error("User sessions fetch error:", error);
      res.status(500).json({ error: "Failed to fetch user sessions" });
    }
  });

  app.get("/api/sessions/:id/details", isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.id;
      const userId = req.user?.claims?.sub;
      
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const presentation = await storage.getPresentation(session.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const presentationSlides = await storage.getSlidesByPresentation(presentation.id);
      const sessionResponses = await storage.getResponsesBySession(session.id);
      const uniqueParticipants = new Set(sessionResponses.map(r => r.participantId));
      
      const slideAnalytics = await Promise.all(
        presentationSlides.map(async (slide) => {
          const slideResponses = await storage.getResponsesBySlide(slide.id, session.id);
          const slideParticipants = new Set(slideResponses.map(r => r.participantId));
          
          return {
            slideId: slide.id,
            slideType: slide.type,
            slideOrder: slide.order,
            question: slide.question,
            responseCount: slideResponses.length,
            uniqueParticipants: slideParticipants.size
          };
        })
      );
      
      res.json({
        id: session.id,
        presentationId: session.presentationId,
        presentationTitle: presentation.title,
        code: session.code,
        startedAt: session.startedAt,
        isActive: session.isActive,
        currentSlideIndex: session.currentSlideIndex,
        participantCount: uniqueParticipants.size,
        responseCount: sessionResponses.length,
        slideAnalytics
      });
    } catch (error) {
      console.error("Session details fetch error:", error);
      res.status(500).json({ error: "Failed to fetch session details" });
    }
  });

  app.get("/api/library", async (req, res) => {
    try {
      const presentations = await storage.getPublishedPresentations();
      
      const presentationsWithDetails = await Promise.all(
        presentations.map(async (presentation) => {
          const slides = await storage.getSlidesByPresentation(presentation.id);
          const user = await storage.getUser(presentation.userId);
          return {
            ...presentation,
            slideCount: slides.length,
            presenterName: user?.username || 'Unknown'
          };
        })
      );
      
      res.json(presentationsWithDetails);
    } catch (error) {
      console.error("Library fetch error:", error);
      res.status(500).json({ error: "Failed to fetch library" });
    }
  });

  app.get("/api/featured-presentations", async (req, res) => {
    try {
      const presentations = await storage.getPublishedPresentations();
      
      const featuredPresentations = await Promise.all(
        presentations.slice(0, 6).map(async (presentation) => {
          const slides = await storage.getSlidesByPresentation(presentation.id);
          const user = await storage.getUser(presentation.userId);
          const firstSlide = slides[0];
          
          return {
            ...presentation,
            slideCount: slides.length,
            presenterName: user?.username || 'Unknown',
            previewSlide: firstSlide || null
          };
        })
      );
      
      res.json(featuredPresentations);
    } catch (error) {
      console.error("Featured presentations fetch error:", error);
      res.status(500).json({ error: "Failed to fetch featured presentations" });
    }
  });

  app.get("/api/library/:id", async (req, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      if (!presentation.published) {
        return res.status(403).json({ error: "This presentation is not published" });
      }
      
      const slides = await storage.getSlidesByPresentation(req.params.id);
      const user = await storage.getUser(presentation.userId);
      
      res.json({
        ...presentation,
        slides,
        presenterName: user?.username || 'Unknown'
      });
    } catch (error) {
      console.error("Library detail fetch error:", error);
      res.status(500).json({ error: "Failed to fetch presentation" });
    }
  });

  app.get("/api/presentations/:id/slides", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const slides = await storage.getSlidesByPresentation(req.params.id);
      res.json(slides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slides" });
    }
  });

  app.post("/api/slides", isAuthenticated, async (req: any, res) => {
    try {
      const data = insertSlideSchema.parse(req.body);
      const presentation = await storage.getPresentation(data.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const slide = await storage.createSlide(data);
      res.json(slide);
    } catch (error) {
      res.status(400).json({ error: "Invalid slide data" });
    }
  });

  app.patch("/api/slides/:id", isAuthenticated, async (req: any, res) => {
    try {
      const slide = await storage.getSlide(req.params.id);
      if (!slide) {
        return res.status(404).json({ error: "Slide not found" });
      }
      const presentation = await storage.getPresentation(slide.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const updated = await storage.updateSlide(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update slide" });
    }
  });

  app.delete("/api/slides/:id", isAuthenticated, async (req: any, res) => {
    try {
      const slide = await storage.getSlide(req.params.id);
      if (!slide) {
        return res.status(404).json({ error: "Slide not found" });
      }
      const presentation = await storage.getPresentation(slide.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const deleted = await storage.deleteSlide(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slide" });
    }
  });

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'application/pdf' || 
          file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
          file.mimetype === 'application/vnd.ms-powerpoint') {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PDF, PPT, and PPTX files are allowed.'));
      }
    }
  });

  const imageUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];
      if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
      }
    }
  });

  app.post("/api/presentations/:id/import", isAuthenticated, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 50MB limit' });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || 'Invalid file type. Only PDF and PPTX files are allowed.' });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const presentationId = req.params.id;
      const fs = await import('fs');
      const path = await import('path');
      
      if (req.file.mimetype === 'application/pdf') {
        const { pdfToPng } = await import('pdf-to-png-converter');
        
        const tempFilePath = `/tmp/${Date.now()}-${req.file.originalname}`;
        await fs.promises.writeFile(tempFilePath, req.file.buffer);
        console.log('📄 PDF written to:', tempFilePath);

        const timestamp = Date.now();
        const publicOutputFolder = path.join(process.cwd(), 'public', 'uploads', `presentation-${presentationId}-${timestamp}`);
        await fs.promises.mkdir(publicOutputFolder, { recursive: true });
        console.log('📁 Created permanent output folder:', publicOutputFolder);

        let pngPages;
        try {
          pngPages = await pdfToPng(tempFilePath, {
            viewportScale: 2.0,
          });
          
          for (let i = 0; i < pngPages.length; i++) {
            const pngFilename = `slide_${i + 1}.png`;
            const pngPath = path.join(publicOutputFolder, pngFilename);
            await fs.promises.writeFile(pngPath, pngPages[i].content);
          }
          
          const files = await fs.promises.readdir(publicOutputFolder);
          console.log('✅ PDF converted. Files written permanently:', files);
        } finally {
          await fs.promises.unlink(tempFilePath);
        }

        const slides = await storage.getSlidesByPresentation(presentationId);
        const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : -1;

        const createdSlides = [];
        for (let i = 0; i < pngPages.length; i++) {
          const imagePath = `/uploads/presentation-${presentationId}-${timestamp}/slide_${i + 1}.png`;
          const slideData = insertSlideSchema.parse({
            presentationId,
            type: 'image',
            order: maxOrder + i + 1,
            question: imagePath,
            options: [],
            config: {}
          });
          const slide = await storage.createSlide(slideData);
          createdSlides.push(slide);
        }

        res.json({ 
          success: true, 
          slidesCreated: createdSlides.length,
          slides: createdSlides
        });
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || 
                 req.file.mimetype === 'application/vnd.ms-powerpoint') {
        const path = await import('path');
        const fs = await import('fs');
        const os = await import('os');
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const fileType = req.file.mimetype === 'application/vnd.ms-powerpoint' ? 'ppt' : 'pptx';
        console.log(`📊 Converting ${fileType.toUpperCase()} to PNG using LibreOffice...`);
        
        const timestamp = Date.now();
        
        // Save buffer to temporary file
        const tempDir = path.join(os.tmpdir(), `ppt-convert-${presentationId}-${timestamp}`);
        await fs.promises.mkdir(tempDir, { recursive: true });
        const tempFilePath = path.join(tempDir, `upload.${fileType}`);
        await fs.promises.writeFile(tempFilePath, req.file.buffer);
        
        const publicOutputFolder = path.join(process.cwd(), 'public', 'uploads', `presentation-${presentationId}-${timestamp}`);
        await fs.promises.mkdir(publicOutputFolder, { recursive: true });
        
        try {
          // Step 1: Convert PPT/PPTX to PDF using LibreOffice
          const pdfOutputDir = path.join(tempDir, 'pdf');
          await fs.promises.mkdir(pdfOutputDir, { recursive: true });
          
          await execAsync(`libreoffice --headless --convert-to pdf --outdir "${pdfOutputDir}" "${tempFilePath}"`, {
            timeout: 120000
          });
          
          // Find the generated PDF
          const pdfFiles = await fs.promises.readdir(pdfOutputDir);
          const pdfFile = pdfFiles.find(f => f.endsWith('.pdf'));
          if (!pdfFile) {
            throw new Error('PDF conversion failed - no PDF file generated');
          }
          const pdfPath = path.join(pdfOutputDir, pdfFile);
          console.log(`✅ Converted to PDF: ${pdfFile}`);
          
          // Step 2: Convert PDF to PNG images
          const { pdfToPng } = await import('pdf-to-png-converter');
          const pdfBuffer = await fs.promises.readFile(pdfPath);
          
          const pngPages = await pdfToPng(pdfBuffer, {
            disableFontFace: true,
            useSystemFonts: true,
            viewportScale: 2.0
          });
          
          // Save PNG files to public folder
          for (let i = 0; i < pngPages.length; i++) {
            const pngFilename = `slide_${i + 1}.png`;
            const destPath = path.join(publicOutputFolder, pngFilename);
            await fs.promises.writeFile(destPath, pngPages[i].content);
          }
          
          console.log(`✅ ${fileType.toUpperCase()} converted. ${pngPages.length} slides written.`);
          
          // Create slides in database
          const slides = await storage.getSlidesByPresentation(presentationId);
          const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : -1;
          
          const createdSlides = [];
          for (let i = 0; i < pngPages.length; i++) {
            const imagePath = `/uploads/presentation-${presentationId}-${timestamp}/slide_${i + 1}.png`;
            const slideData = insertSlideSchema.parse({
              presentationId,
              type: 'image',
              order: maxOrder + i + 1,
              question: imagePath,
              options: [],
              config: {}
            });
            const slide = await storage.createSlide(slideData);
            createdSlides.push(slide);
          }
          
          res.json({ 
            success: true, 
            slidesCreated: createdSlides.length,
            slides: createdSlides
          });
        } finally {
          // Cleanup temp directory
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        }
      }
    } catch (error: any) {
      console.error('File import error:', error);
      res.status(500).json({ error: error.message || "Failed to import file" });
    }
  });

  app.post("/api/slides/:slideId/upload-image", isAuthenticated, (req, res, next) => {
    imageUpload.single('image')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Image size exceeds 10MB limit' });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || 'Invalid file type. Only image files are allowed.' });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image uploaded" });
      }

      const slideId = req.params.slideId;
      const fs = await import('fs');
      const path = await import('path');
      const { fileTypeFromBuffer } = await import('file-type');
      const { randomUUID } = await import('crypto');

      const slide = await storage.getSlide(slideId);
      if (!slide) {
        return res.status(404).json({ error: "Slide not found" });
      }

      const presentation = await storage.getPresentation(slide.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const fileType = await fileTypeFromBuffer(req.file.buffer);
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      
      if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
        return res.status(400).json({ 
          error: 'Invalid file content. Only JPEG, PNG, GIF, and WebP images are allowed.' 
        });
      }

      const timestamp = Date.now();
      const publicOutputFolder = path.join(process.cwd(), 'public', 'uploads', `presentation-${slide.presentationId}-${timestamp}`);
      await fs.promises.mkdir(publicOutputFolder, { recursive: true });

      const mimeToExtension: { [key: string]: string } = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp'
      };
      const safeExtension = mimeToExtension[fileType.mime];
      const elementId = randomUUID();
      const fileName = `element-${elementId}${safeExtension}`;
      const filePath = path.join(publicOutputFolder, fileName);
      await fs.promises.writeFile(filePath, req.file.buffer);
      
      console.log('✅ Image uploaded to:', filePath);

      const imagePath = `/uploads/presentation-${slide.presentationId}-${timestamp}/${fileName}`;
      
      const config = slide.config || { elements: [] };
      const elements = config.elements || [];
      
      // High z-index ensures images render in foreground above other slide content
      const imageElements = elements.filter((el: any) => el.type === 'image');
      const newElement = {
        type: 'image' as const,
        id: elementId,
        src: imagePath,
        x: 25,
        y: 25,
        width: 50,
        height: 50,
        zIndex: 500 + imageElements.length,  // High z-index for images (below text at 1000+)
      };
      
      elements.push(newElement);
      
      const updatedSlide = await storage.updateSlide(slideId, {
        config: { ...config, elements }
      });

      res.json({ 
        success: true, 
        element: newElement,
        slide: updatedSlide
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      res.status(500).json({ error: error.message || "Failed to upload image" });
    }
  });

  app.post("/api/sessions", isAuthenticated, async (req: any, res) => {
    try {
      if (!req.body.presentationId) {
        return res.status(400).json({ error: "Presentation ID is required" });
      }

      const presentation = await storage.getPresentation(req.body.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      let code = generateRoomCode();
      let existing = await storage.getSessionByCode(code);
      while (existing) {
        code = generateRoomCode();
        existing = await storage.getSessionByCode(code);
      }
      
      const data = insertPresentationSessionSchema.parse({
        presentationId: req.body.presentationId,
        code,
        currentSlideIndex: 0,
        isActive: true
      });
      
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
      console.error("Session creation error:", error);
      res.status(400).json({ error: "Invalid session data" });
    }
  });

  app.get("/api/presentations/:presentationId/sessions/active", isAuthenticated, async (req: any, res) => {
    try {
      const presentationId = req.params.presentationId;
      const presentation = await storage.getPresentation(presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const sessions = await storage.getActiveSessionsByPresentation(presentationId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
      res.status(500).json({ error: "Failed to fetch active sessions" });
    }
  });

  app.get("/api/sessions/code/:code", async (req, res) => {
    try {
      const session = await storage.getSessionByCode(req.params.code);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  app.patch("/api/sessions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      const presentation = await storage.getPresentation(session.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const updated = await storage.updateSession(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.post("/api/sessions/:id/end", isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      const presentation = await storage.getPresentation(session.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const ended = await storage.endSession(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to end session" });
    }
  });

  app.get("/api/sessions/:id/responses", async (req, res) => {
    try {
      const responses = await storage.getResponsesBySession(req.params.id);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.get("/api/slides/:slideId/responses/:sessionId", async (req, res) => {
    try {
      const responses = await storage.getResponsesBySlide(req.params.slideId, req.params.sessionId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.get("/api/slides/:slideId/all-responses", async (req, res) => {
    try {
      const responses = await storage.getAllResponsesBySlide(req.params.slideId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const data = insertNoteSchema.parse({
        ...req.body,
        userId
      });
      
      const existingNote = await storage.getNotesBySlide(userId, data.slideId);
      if (existingNote) {
        const updated = await storage.updateNote(existingNote.id, data.content);
        return res.json(updated);
      }
      
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error) {
      console.error("Note creation error:", error);
      res.status(400).json({ error: "Invalid note data" });
    }
  });

  app.get("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const notes = await storage.getNotesByUser(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/slide/:slideId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const note = await storage.getNotesBySlide(userId, req.params.slideId);
      res.json(note || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: "Content is required" });
      }
      
      const updated = await storage.updateNote(req.params.id, content);
      if (!updated) {
        return res.status(404).json({ error: "Note not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update note" });
    }
  });

  app.delete("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const deleted = await storage.deleteNote(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete note" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      const feedbackItem = await storage.createFeedback(data);
      res.json(feedbackItem);
    } catch (error) {
      console.error("Feedback creation error:", error);
      res.status(400).json({ error: "Invalid feedback data" });
    }
  });

  app.get("/api/sessions/:sessionId/feedback", async (req, res) => {
    try {
      const feedbacks = await storage.getFeedbackBySession(req.params.sessionId);
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.get("/api/sessions/:sessionId/feedback-with-slides", isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getSession(req.params.sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      const presentation = await storage.getPresentation(session.presentationId);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      
      const userId = req.user?.claims?.sub;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      const feedbacks = await storage.getFeedbackBySession(req.params.sessionId);
      const slides = await storage.getSlidesByPresentation(session.presentationId);
      
      const feedbackWithSlides = feedbacks.map(fb => {
        const slide = slides.find((s: any) => s.id === fb.slideId);
        return {
          ...fb,
          slide: slide ? {
            id: slide.id,
            type: slide.type,
            question: slide.question,
            order: slide.order
          } : null
        };
      });
      
      res.json(feedbackWithSlides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback with slides" });
    }
  });

  app.get("/api/slides/:slideId/feedback/:sessionId", async (req, res) => {
    try {
      const feedbacks = await storage.getFeedbackBySlide(req.params.slideId, req.params.sessionId);
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.post("/api/reactions", async (req, res) => {
    try {
      const data = insertReactionSchema.parse(req.body);
      
      const existingReaction = await storage.getParticipantReaction(
        data.slideId,
        data.sessionId,
        data.participantId
      );
      
      if (existingReaction) {
        await storage.deleteReaction(existingReaction.id);
        
        if (existingReaction.reactionType === data.reactionType) {
          const allReactions = await storage.getReactionsBySlide(data.slideId, data.sessionId);
          io.to(data.sessionId).emit('reactions_updated', {
            slideId: data.slideId,
            reactions: allReactions
          });
          return res.json({ success: true, removed: true });
        }
      }
      
      const reaction = await storage.createReaction(data);
      const allReactions = await storage.getReactionsBySlide(data.slideId, data.sessionId);
      
      io.to(data.sessionId).emit('reactions_updated', {
        slideId: data.slideId,
        reactions: allReactions
      });
      
      res.json(reaction);
    } catch (error) {
      console.error("Reaction creation error:", error);
      res.status(400).json({ error: "Invalid reaction data" });
    }
  });

  app.get("/api/slides/:slideId/reactions/:sessionId", async (req, res) => {
    try {
      const reactions = await storage.getReactionsBySlide(req.params.slideId, req.params.sessionId);
      res.json(reactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });

  // Q&A Routes
  app.post("/api/questions", async (req, res) => {
    try {
      const data = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(data);
      
      io.to(data.sessionId).emit('new_question', question);
      
      res.json(question);
    } catch (error) {
      console.error("Question creation error:", error);
      res.status(400).json({ error: "Invalid question data" });
    }
  });

  app.get("/api/sessions/:sessionId/questions", async (req, res) => {
    try {
      const questions = await storage.getQuestionsBySession(req.params.sessionId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  app.post("/api/questions/:questionId/upvote", async (req, res) => {
    try {
      const { participantId } = req.body;
      if (!participantId) {
        return res.status(400).json({ error: "participantId is required" });
      }

      const hasVoted = await storage.hasUpvoted(req.params.questionId, participantId);
      
      if (hasVoted) {
        await storage.removeUpvote(req.params.questionId, participantId);
      } else {
        await storage.upvoteQuestion(req.params.questionId, participantId);
      }
      
      const questions = await storage.getQuestionsBySession(req.body.sessionId);
      io.to(req.body.sessionId).emit('questions_updated', questions);
      
      res.json({ success: true, upvoted: !hasVoted });
    } catch (error) {
      console.error("Upvote error:", error);
      res.status(500).json({ error: "Failed to process upvote" });
    }
  });

  const httpServer = createServer(app);
  
  // Initialize Socket.IO server with CORS and transports configuration
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true
  });

  // Set up session middleware for Socket.IO
  const wrap = (middleware: any) => (socket: any, next: any) => 
    middleware(socket.request, {} as any, next);
  
  const sessionMiddleware = getSession();
  io.use(wrap(sessionMiddleware));
  io.use(wrap(passport.initialize()));
  io.use(wrap(passport.session()));

  console.log('🔌 Socket.IO server initialized with session support');

  io.on('connection', (socket) => {
    console.log('✅ New Socket.IO connection:', socket.id);
    const clientData: SocketClient = {};
    const req = (socket.request as any);

    socket.on('join_session', async ({ code, role, participantId }) => {
      try {
        const session = await storage.getSessionByCode(code);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        if (role === 'presenter') {
          if (!req.isAuthenticated || !req.isAuthenticated()) {
            socket.emit('error', { message: 'Authentication required for presenters' });
            return;
          }
          
          const userId = req.user?.claims?.sub;
          if (!userId) {
            socket.emit('error', { message: 'User ID not found in session' });
            return;
          }
          
          const presentation = await storage.getPresentation(session.presentationId);
          if (!presentation) {
            socket.emit('error', { message: 'Presentation not found' });
            return;
          }
          
          if (presentation.userId !== userId) {
            socket.emit('error', { message: 'Unauthorized: Not presentation owner' });
            return;
          }
        }
        
        clientData.sessionId = session.id;
        clientData.role = role;
        
        if (role === 'audience') {
          clientData.participantId = participantId || randomBytes(8).toString('hex');
        }
        
        // Store client data on socket BEFORE counting (so this socket is included)
        (socket as any).data = clientData;
        
        // Join Socket.IO room for this session
        socket.join(session.id);
        
        // Count participants in this session's room (now includes this socket)
        const sockets = await io.in(session.id).fetchSockets();
        const participantCount = sockets.filter(s => {
          const data = (s as any).data as SocketClient;
          return data.role === 'audience';
        }).length;
        
        io.to(session.id).emit('participant_count', { count: participantCount });
        
        const slides = await storage.getSlidesByPresentation(session.presentationId);
        const currentSlide = slides[session.currentSlideIndex];
        
        socket.emit('session_joined', {
          session,
          currentSlide,
          slides,
          participantId: clientData.participantId
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    socket.on('submit_response', async ({ slideId, answer }) => {
      try {
        if (!clientData.sessionId || !clientData.participantId) {
          socket.emit('error', { message: 'Not in a session' });
          return;
        }
        
        const responseData = insertResponseSchema.parse({
          sessionId: clientData.sessionId,
          slideId,
          participantId: clientData.participantId,
          answer
        });
        
        const response = await storage.createResponse(responseData);
        const allResponses = await storage.getResponsesBySlide(slideId, clientData.sessionId);
        
        io.to(clientData.sessionId).emit('new_response', {
          response,
          slideId,
          totalResponses: allResponses.length
        });
        
        socket.emit('response_submitted', { response });
      } catch (error) {
        socket.emit('error', { message: 'Failed to submit response' });
      }
    });

    socket.on('send_emoji', ({ emoji }) => {
      try {
        if (!clientData.sessionId) {
          socket.emit('error', { message: 'Not in a session' });
          return;
        }
        
        io.to(clientData.sessionId).emit('emoji_sent', {
          emoji,
          participantId: clientData.participantId
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to send emoji' });
      }
    });

    socket.on('navigate_slide', async ({ slideIndex }) => {
      try {
        if (!clientData.sessionId || clientData.role !== 'presenter') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        const updatedSession = await storage.updateSession(clientData.sessionId, {
          currentSlideIndex: slideIndex
        });
        
        if (updatedSession) {
          const sessionSlides = await storage.getSlidesByPresentation(updatedSession.presentationId);
          const newSlide = sessionSlides[slideIndex];
          
          io.to(clientData.sessionId).emit('slide_changed', {
            slideIndex,
            slide: newSlide
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to navigate slide' });
      }
    });

    socket.on('add_annotation', async ({ annotation }) => {
      try {
        if (!clientData.sessionId || clientData.role !== 'presenter') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        // Broadcast annotation to all participants in the session
        io.to(clientData.sessionId).emit('annotation_added', { annotation });
      } catch (error) {
        socket.emit('error', { message: 'Failed to add annotation' });
      }
    });

    socket.on('clear_annotations', async () => {
      try {
        if (!clientData.sessionId || clientData.role !== 'presenter') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }
        
        // Broadcast clear command to all participants
        io.to(clientData.sessionId).emit('annotations_cleared');
      } catch (error) {
        socket.emit('error', { message: 'Failed to clear annotations' });
      }
    });

    socket.on('disconnect', async () => {
      if (clientData.sessionId) {
        const sockets = await io.in(clientData.sessionId).fetchSockets();
        const participantCount = sockets.filter(s => {
          const data = (s as any).data as SocketClient;
          return data.role === 'audience' && s.id !== socket.id;
        }).length;
        
        io.to(clientData.sessionId).emit('participant_count', { count: participantCount });
      }
    });
  });

  return httpServer;
}
