import { 
  type Presentation, type InsertPresentation,
  type Slide, type InsertSlide,
  type Session, type InsertSession,
  type Response, type InsertResponse
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  getPresentation(id: string): Promise<Presentation | undefined>;
  getAllPresentations(): Promise<Presentation[]>;
  updatePresentation(id: string, presentation: Partial<InsertPresentation>): Promise<Presentation | undefined>;
  deletePresentation(id: string): Promise<boolean>;

  createSlide(slide: InsertSlide): Promise<Slide>;
  getSlide(id: string): Promise<Slide | undefined>;
  getSlidesByPresentation(presentationId: string): Promise<Slide[]>;
  updateSlide(id: string, slide: Partial<InsertSlide>): Promise<Slide | undefined>;
  deleteSlide(id: string): Promise<boolean>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionByCode(code: string): Promise<Session | undefined>;
  updateSession(id: string, session: Partial<Omit<InsertSession, 'presentationId' | 'code'>>): Promise<Session | undefined>;
  endSession(id: string): Promise<boolean>;
  
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesBySession(sessionId: string): Promise<Response[]>;
  getResponsesBySlide(slideId: string, sessionId: string): Promise<Response[]>;
}

export class MemStorage implements IStorage {
  private presentations: Map<string, Presentation>;
  private slides: Map<string, Slide>;
  private sessions: Map<string, Session>;
  private responses: Map<string, Response>;

  constructor() {
    this.presentations = new Map();
    this.slides = new Map();
    this.sessions = new Map();
    this.responses = new Map();
  }

  async createPresentation(insertPresentation: InsertPresentation): Promise<Presentation> {
    const id = randomUUID();
    const now = new Date();
    const presentation: Presentation = { 
      ...insertPresentation, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.presentations.set(id, presentation);
    return presentation;
  }

  async getPresentation(id: string): Promise<Presentation | undefined> {
    return this.presentations.get(id);
  }

  async getAllPresentations(): Promise<Presentation[]> {
    return Array.from(this.presentations.values()).sort((a, b) => 
      b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  async updatePresentation(id: string, update: Partial<InsertPresentation>): Promise<Presentation | undefined> {
    const presentation = this.presentations.get(id);
    if (!presentation) return undefined;
    
    const updated: Presentation = {
      ...presentation,
      ...update,
      updatedAt: new Date()
    };
    this.presentations.set(id, updated);
    return updated;
  }

  async deletePresentation(id: string): Promise<boolean> {
    const deleted = this.presentations.delete(id);
    if (deleted) {
      Array.from(this.slides.values())
        .filter(s => s.presentationId === id)
        .forEach(s => this.slides.delete(s.id));
    }
    return deleted;
  }

  async createSlide(insertSlide: InsertSlide): Promise<Slide> {
    const id = randomUUID();
    const slide: Slide = { 
      ...insertSlide, 
      id,
      options: insertSlide.options ?? null,
      question: insertSlide.question ?? null,
      config: insertSlide.config ?? null
    };
    this.slides.set(id, slide);
    return slide;
  }

  async getSlide(id: string): Promise<Slide | undefined> {
    return this.slides.get(id);
  }

  async getSlidesByPresentation(presentationId: string): Promise<Slide[]> {
    return Array.from(this.slides.values())
      .filter(s => s.presentationId === presentationId)
      .sort((a, b) => a.order - b.order);
  }

  async updateSlide(id: string, update: Partial<InsertSlide>): Promise<Slide | undefined> {
    const slide = this.slides.get(id);
    if (!slide) return undefined;
    
    const updated: Slide = { 
      ...slide, 
      ...update,
      options: update.options !== undefined ? update.options : slide.options,
      question: update.question !== undefined ? update.question : slide.question,
      config: update.config !== undefined ? update.config : slide.config
    };
    this.slides.set(id, updated);
    return updated;
  }

  async deleteSlide(id: string): Promise<boolean> {
    return this.slides.delete(id);
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = randomUUID();
    const session: Session = { 
      ...insertSession,
      id,
      currentSlideIndex: insertSession.currentSlideIndex ?? 0,
      isActive: insertSession.isActive ?? true,
      startedAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByCode(code: string): Promise<Session | undefined> {
    return Array.from(this.sessions.values()).find(s => s.code === code);
  }

  async updateSession(id: string, update: Partial<Omit<InsertSession, 'presentationId' | 'code'>>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated: Session = { ...session, ...update };
    this.sessions.set(id, updated);
    return updated;
  }

  async endSession(id: string): Promise<boolean> {
    const session = this.sessions.get(id);
    if (!session) return false;
    
    session.isActive = false;
    this.sessions.set(id, session);
    return true;
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const id = randomUUID();
    const response: Response = { 
      ...insertResponse, 
      id,
      submittedAt: new Date()
    };
    this.responses.set(id, response);
    return response;
  }

  async getResponsesBySession(sessionId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(r => r.sessionId === sessionId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getResponsesBySlide(slideId: string, sessionId: string): Promise<Response[]> {
    return Array.from(this.responses.values())
      .filter(r => r.slideId === slideId && r.sessionId === sessionId);
  }
}

export const storage = new MemStorage();
