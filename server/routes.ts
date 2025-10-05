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
import multer from "multer";
import officeParser from "officeparser";

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

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/pdf'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only PPT, PPTX, and PDF files are allowed.'));
      }
    }
  });

  app.post("/api/presentations/:id/import", (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size exceeds 50MB limit' });
          }
          return res.status(400).json({ error: err.message });
        }
        return res.status(400).json({ error: err.message || 'Invalid file type. Only PPT, PPTX, and PDF files are allowed.' });
      }
      next();
    });
  }, async (req, res) => {
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
          console.log('🔄 Starting PDF to PNG conversion...');
          pngPages = await pdfToPng(tempFilePath, {
            outputFolder,
            outputFileMaskFunc: (pageNumber) => `slide_${pageNumber}.png`,
            viewportScale: 2.0,
          });
          console.log('✅ PDF conversion complete. Pages:', pngPages.length);
          console.log('📄 First page info:', pngPages[0]);
          
          const files = await fs.promises.readdir(outputFolder);
          console.log('📂 Files in output folder:', files);
        } finally {
          await fs.promises.unlink(tempFilePath);
          console.log('🗑️ Deleted temp PDF file');
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
