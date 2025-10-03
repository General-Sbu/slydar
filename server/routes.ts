import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  insertPresentationSchema, 
  insertSlideSchema, 
  insertSessionSchema,
  insertResponseSchema 
} from "@shared/schema";
import { randomBytes } from "crypto";

interface WSClient {
  ws: WebSocket;
  sessionId?: string;
  role?: 'presenter' | 'audience';
  participantId?: string;
}

const clients = new Map<WebSocket, WSClient>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function broadcastToSession(sessionId: string, message: any, excludeWs?: WebSocket) {
  clients.forEach((client, ws) => {
    if (client.sessionId === sessionId && ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
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
      
      broadcastToSession(req.params.id, {
        type: 'session_update',
        session: updated
      });
      
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
      
      broadcastToSession(req.params.id, {
        type: 'session_ended'
      });
      
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
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const clientData: WSClient = { ws };
    clients.set(ws, clientData);

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_session':
            const session = await storage.getSessionByCode(message.code);
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
              return;
            }
            
            clientData.sessionId = session.id;
            clientData.role = message.role;
            
            if (message.role === 'audience') {
              clientData.participantId = message.participantId || randomBytes(8).toString('hex');
            }
            
            const participantCount = Array.from(clients.values())
              .filter(c => c.sessionId === session.id && c.role === 'audience').length;
            
            broadcastToSession(session.id, {
              type: 'participant_count',
              count: participantCount
            });
            
            const slides = await storage.getSlidesByPresentation(session.presentationId);
            const currentSlide = slides[session.currentSlideIndex];
            
            ws.send(JSON.stringify({
              type: 'session_joined',
              session,
              currentSlide,
              slides,
              participantId: clientData.participantId
            }));
            break;

          case 'submit_response':
            if (!clientData.sessionId || !clientData.participantId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not in a session' }));
              return;
            }
            
            const responseData = insertResponseSchema.parse({
              sessionId: clientData.sessionId,
              slideId: message.slideId,
              participantId: clientData.participantId,
              answer: message.answer
            });
            
            const response = await storage.createResponse(responseData);
            
            const allResponses = await storage.getResponsesBySlide(message.slideId, clientData.sessionId);
            
            broadcastToSession(clientData.sessionId, {
              type: 'new_response',
              response,
              slideId: message.slideId,
              totalResponses: allResponses.length
            });
            
            ws.send(JSON.stringify({
              type: 'response_submitted',
              response
            }));
            break;

          case 'navigate_slide':
            if (!clientData.sessionId || clientData.role !== 'presenter') {
              ws.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }));
              return;
            }
            
            const updatedSession = await storage.updateSession(clientData.sessionId, {
              currentSlideIndex: message.slideIndex
            });
            
            if (updatedSession) {
              const sessionSlides = await storage.getSlidesByPresentation(updatedSession.presentationId);
              const newSlide = sessionSlides[message.slideIndex];
              
              broadcastToSession(clientData.sessionId, {
                type: 'slide_changed',
                slideIndex: message.slideIndex,
                slide: newSlide
              });
            }
            break;
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (clientData.sessionId) {
        const participantCount = Array.from(clients.values())
          .filter(c => c.sessionId === clientData.sessionId && c.role === 'audience' && c.ws !== ws).length;
        
        broadcastToSession(clientData.sessionId, {
          type: 'participant_count',
          count: participantCount
        });
      }
      clients.delete(ws);
    });
  });

  return httpServer;
}
