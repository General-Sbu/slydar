import type { Express } from "express";
import { createServer, type Server } from "http";
import { Server as SocketIOServer } from "socket.io";
import { storage } from "./storage";
import { 
  insertPresentationSchema, 
  insertSlideSchema, 
  insertSessionSchema,
  insertResponseSchema 
} from "@shared/schema";
import { randomBytes } from "crypto";

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
  app.get("/api/presentations", async (req, res) => {
    try {
      const presentations = await storage.getAllPresentations();
      res.json(presentations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presentations" });
    }
  });

  app.post("/api/presentations", async (req, res) => {
    try {
      const data = insertPresentationSchema.parse(req.body);
      const presentation = await storage.createPresentation(data);
      res.json(presentation);
    } catch (error) {
      res.status(400).json({ error: "Invalid presentation data" });
    }
  });

  app.get("/api/presentations/:id", async (req, res) => {
    try {
      const presentation = await storage.getPresentation(req.params.id);
      if (!presentation) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      res.json(presentation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presentation" });
    }
  });

  app.patch("/api/presentations/:id", async (req, res) => {
    try {
      const updated = await storage.updatePresentation(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update presentation" });
    }
  });

  app.delete("/api/presentations/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePresentation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete presentation" });
    }
  });

  app.get("/api/presentations/:id/slides", async (req, res) => {
    try {
      const slides = await storage.getSlidesByPresentation(req.params.id);
      res.json(slides);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch slides" });
    }
  });

  app.post("/api/slides", async (req, res) => {
    try {
      const data = insertSlideSchema.parse(req.body);
      const slide = await storage.createSlide(data);
      res.json(slide);
    } catch (error) {
      res.status(400).json({ error: "Invalid slide data" });
    }
  });

  app.patch("/api/slides/:id", async (req, res) => {
    try {
      const updated = await storage.updateSlide(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Slide not found" });
      }
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update slide" });
    }
  });

  app.delete("/api/slides/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSlide(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Slide not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete slide" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      let code = generateRoomCode();
      let existing = await storage.getSessionByCode(code);
      while (existing) {
        code = generateRoomCode();
        existing = await storage.getSessionByCode(code);
      }
      
      const data = insertSessionSchema.parse({
        ...req.body,
        code,
        currentSlideIndex: 0,
        isActive: true
      });
      const session = await storage.createSession(data);
      res.json(session);
    } catch (error) {
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

  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const updated = await storage.updateSession(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const ended = await storage.endSession(req.params.id);
      if (!ended) {
        return res.status(404).json({ error: "Session not found" });
      }
      
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

  const httpServer = createServer(app);
  
  // Initialize Socket.IO server with CORS and transports configuration
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true
  });

  console.log('🔌 Socket.IO server initialized');

  io.on('connection', (socket) => {
    console.log('✅ New Socket.IO connection:', socket.id);
    const clientData: SocketClient = {};

    socket.on('join_session', async ({ code, role, participantId }) => {
      try {
        const session = await storage.getSessionByCode(code);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }
        
        clientData.sessionId = session.id;
        clientData.role = role;
        
        if (role === 'audience') {
          clientData.participantId = participantId || randomBytes(8).toString('hex');
        }
        
        // Join Socket.IO room for this session
        socket.join(session.id);
        
        // Count participants in this session's room
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
        
        // Store client data on socket for later reference
        (socket as any).data = clientData;
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
