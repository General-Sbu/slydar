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
  insertFeedbackSchema
} from "@shared/schema";
import { randomBytes } from "crypto";
import multer from "multer";
import officeParser from "officeparser";
import { setupAuth, isAuthenticated, getSession } from "./auth";
import passport from "passport";
import bcrypt from "bcrypt";
import { registerSchema, loginSchema } from "@shared/schema";

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
  await setupAuth(app);

  app.post('/api/auth/register', async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        res.json(user);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

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
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get("/api/presentations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const data = insertPresentationSchema.parse({
        ...req.body,
        userId
      });
      const presentation = await storage.createPresentation(data);
      res.json(presentation);
    } catch (error) {
      res.status(400).json({ error: "Invalid presentation data" });
    }
  });

  app.get("/api/presentations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      if (presentation.userId !== userId) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const deleted = await storage.deletePresentation(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete presentation" });
    }
  });

  app.get("/api/presentations/:id/slides", isAuthenticated, async (req: any, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PPTX and PDF files are allowed.'));
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
        return res.status(400).json({ error: err.message || 'Invalid file type. Only PPTX and PDF files are allowed.' });
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

        const uploadsDir = '/tmp/uploads';
        await fs.promises.mkdir(uploadsDir, { recursive: true });
        console.log('📁 Created uploads dir:', uploadsDir);

        const timestamp = Date.now();
        const outputFolder = path.join(uploadsDir, `presentation-${presentationId}-${timestamp}`);
        await fs.promises.mkdir(outputFolder, { recursive: true });
        console.log('📁 Created output folder:', outputFolder);

        let pngPages;
        try {
          pngPages = await pdfToPng(tempFilePath, {
            viewportScale: 2.0,
          });
          
          for (let i = 0; i < pngPages.length; i++) {
            const pngFilename = `slide_${i + 1}.png`;
            const pngPath = path.join(outputFolder, pngFilename);
            await fs.promises.writeFile(pngPath, pngPages[i].content);
          }
          
          const files = await fs.promises.readdir(outputFolder);
          console.log('✅ PDF converted. Files written:', files);
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
      } else {
        const tempFilePath = `/tmp/${Date.now()}-${req.file.originalname}`;
        await fs.promises.writeFile(tempFilePath, req.file.buffer);

        let text: string;
        try {
          text = await new Promise<string>((resolve, reject) => {
            officeParser.parseOffice(tempFilePath, (data: string, err: Error | null) => {
              if (err) {
                reject(err);
              } else if (data) {
                resolve(data);
              } else {
                reject(new Error('No data returned from parser'));
              }
            });
          });
        } finally {
          await fs.promises.unlink(tempFilePath);
        }

        const lines = text.split('\n').filter(line => line.trim().length > 0);
        
        const slides = await storage.getSlidesByPresentation(presentationId);
        const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.order)) : -1;
        
        const createdSlides = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.length > 0) {
            const slideData = insertSlideSchema.parse({
              presentationId,
              type: 'heading',
              order: maxOrder + i + 1,
              question: line,
              options: [],
              config: {}
            });
            const slide = await storage.createSlide(slideData);
            createdSlides.push(slide);
          }
        }

        res.json({ 
          success: true, 
          slidesCreated: createdSlides.length,
          slides: createdSlides
        });
      }
    } catch (error: any) {
      console.error('File import error:', error);
      res.status(500).json({ error: error.message || "Failed to import file" });
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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
      const userId = req.user.id;
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

  app.post("/api/notes", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      const userId = req.user.id;
      const notes = await storage.getNotesByUser(userId);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notes" });
    }
  });

  app.get("/api/notes/slide/:slideId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const note = await storage.getNotesBySlide(userId, req.params.slideId);
      res.json(note || null);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch note" });
    }
  });

  app.patch("/api/notes/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
      
      const userId = req.user.id;
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
          
          const userId = req.user?.id;
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
