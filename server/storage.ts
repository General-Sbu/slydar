import { 
  type Presentation, type InsertPresentation,
  type Slide, type InsertSlide,
  type PresentationSession, type InsertPresentationSession,
  type Response, type InsertResponse,
  type User, type UpsertUser,
  type Note, type InsertNote,
  type Feedback, type InsertFeedback,
  type Reaction, type InsertReaction
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { 
  users, presentations, slides, presentationSessions, responses, notes, feedback, reactions
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

type UserWithPassword = User & { password: string };

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<UserWithPassword | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;

  createPresentation(presentation: InsertPresentation): Promise<Presentation>;
  getPresentation(id: string): Promise<Presentation | undefined>;
  getAllPresentations(): Promise<Presentation[]>;
  getPresentationsByUser(userId: string): Promise<Presentation[]>;
  updatePresentation(id: string, presentation: Partial<InsertPresentation>): Promise<Presentation | undefined>;
  deletePresentation(id: string): Promise<boolean>;

  createSlide(slide: InsertSlide): Promise<Slide>;
  getSlide(id: string): Promise<Slide | undefined>;
  getSlidesByPresentation(presentationId: string): Promise<Slide[]>;
  updateSlide(id: string, slide: Partial<InsertSlide>): Promise<Slide | undefined>;
  deleteSlide(id: string): Promise<boolean>;
  
  createSession(session: InsertPresentationSession): Promise<PresentationSession>;
  getSession(id: string): Promise<PresentationSession | undefined>;
  getSessionByCode(code: string): Promise<PresentationSession | undefined>;
  getActiveSessionsByPresentation(presentationId: string): Promise<PresentationSession[]>;
  updateSession(id: string, session: Partial<Omit<InsertPresentationSession, 'presentationId' | 'code'>>): Promise<PresentationSession | undefined>;
  endSession(id: string): Promise<boolean>;
  
  createResponse(response: InsertResponse): Promise<Response>;
  getResponsesBySession(sessionId: string): Promise<Response[]>;
  getResponsesBySlide(slideId: string, sessionId: string): Promise<Response[]>;

  createNote(note: InsertNote): Promise<Note>;
  getNotesByUser(userId: string): Promise<Note[]>;
  getNotesBySlide(userId: string, slideId: string): Promise<Note | undefined>;
  updateNote(id: string, content: string): Promise<Note | undefined>;
  deleteNote(id: string): Promise<boolean>;

  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackBySession(sessionId: string): Promise<Feedback[]>;
  getFeedbackBySlide(slideId: string, sessionId: string): Promise<Feedback[]>;

  createReaction(reaction: InsertReaction): Promise<Reaction>;
  getReactionsBySlide(slideId: string, sessionId: string): Promise<Reaction[]>;
  getParticipantReaction(slideId: string, sessionId: string, participantId: string): Promise<Reaction | undefined>;
  deleteReaction(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, UserWithPassword>;
  private presentations: Map<string, Presentation>;
  private slides: Map<string, Slide>;
  private sessions: Map<string, PresentationSession>;
  private responses: Map<string, Response>;
  private feedbacks: Map<string, Feedback>;
  private reactions: Map<string, Reaction>;

  constructor() {
    this.users = new Map();
    this.presentations = new Map();
    this.slides = new Map();
    this.sessions = new Map();
    this.responses = new Map();
    this.feedbacks = new Map();
    this.reactions = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserByUsername(username: string): Promise<UserWithPassword | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const id = randomUUID();
    const now = new Date();
    const user: UserWithPassword = {
      ...userData,
      id,
      username: userData.username!,
      password: userData.password!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(user.id, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.id ? this.users.get(userData.id) : undefined;
    const now = new Date();
    const user: UserWithPassword = {
      ...userData,
      id: userData.id || randomUUID(),
      username: userData.username!,
      password: userData.password!,
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      createdAt: existingUser?.createdAt ?? now,
      updatedAt: now
    };
    this.users.set(user.id, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
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

  async getPresentationsByUser(userId: string): Promise<Presentation[]> {
    return Array.from(this.presentations.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
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

  async createSession(insertSession: InsertPresentationSession): Promise<PresentationSession> {
    const id = randomUUID();
    const session: PresentationSession = { 
      presentationId: insertSession.presentationId,
      code: insertSession.code,
      id,
      currentSlideIndex: insertSession.currentSlideIndex,
      isActive: insertSession.isActive,
      startedAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: string): Promise<PresentationSession | undefined> {
    return this.sessions.get(id);
  }

  async getSessionByCode(code: string): Promise<PresentationSession | undefined> {
    return Array.from(this.sessions.values()).find(s => s.code === code);
  }

  async getActiveSessionsByPresentation(presentationId: string): Promise<PresentationSession[]> {
    return Array.from(this.sessions.values())
      .filter(s => s.presentationId === presentationId && s.isActive)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  }

  async updateSession(id: string, update: Partial<Omit<InsertPresentationSession, 'presentationId' | 'code'>>): Promise<PresentationSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updated: PresentationSession = { ...session, ...update };
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

  async createNote(insertNote: InsertNote): Promise<Note> {
    const id = randomUUID();
    const now = new Date();
    const note: Note = { 
      ...insertNote, 
      id,
      createdAt: now,
      updatedAt: now
    };
    return note;
  }

  async getNotesByUser(userId: string): Promise<Note[]> {
    return [];
  }

  async getNotesBySlide(userId: string, slideId: string): Promise<Note | undefined> {
    return undefined;
  }

  async updateNote(id: string, content: string): Promise<Note | undefined> {
    return undefined;
  }

  async deleteNote(id: string): Promise<boolean> {
    return false;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = randomUUID();
    const feedbackItem: Feedback = { 
      ...insertFeedback, 
      id,
      submittedAt: new Date()
    };
    this.feedbacks.set(id, feedbackItem);
    return feedbackItem;
  }

  async getFeedbackBySession(sessionId: string): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values())
      .filter(f => f.sessionId === sessionId)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  async getFeedbackBySlide(slideId: string, sessionId: string): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values())
      .filter(f => f.slideId === slideId && f.sessionId === sessionId);
  }

  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const existingReaction = await this.getParticipantReaction(
      insertReaction.slideId,
      insertReaction.sessionId,
      insertReaction.participantId
    );
    
    if (existingReaction) {
      await this.deleteReaction(existingReaction.id);
    }
    
    const id = randomUUID();
    const reaction: Reaction = {
      ...insertReaction,
      id,
      submittedAt: new Date()
    };
    this.reactions.set(id, reaction);
    return reaction;
  }

  async getReactionsBySlide(slideId: string, sessionId: string): Promise<Reaction[]> {
    return Array.from(this.reactions.values())
      .filter(r => r.slideId === slideId && r.sessionId === sessionId);
  }

  async getParticipantReaction(slideId: string, sessionId: string, participantId: string): Promise<Reaction | undefined> {
    return Array.from(this.reactions.values())
      .find(r => r.slideId === slideId && r.sessionId === sessionId && r.participantId === participantId);
  }

  async deleteReaction(id: string): Promise<boolean> {
    return this.reactions.delete(id);
  }
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!result[0]) return undefined;
    const { password: _, ...userWithoutPassword } = result[0];
    return userWithoutPassword as User;
  }

  async getUserByUsername(username: string): Promise<UserWithPassword | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0] as UserWithPassword | undefined;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: { 
          ...userData,
          updatedAt: new Date()
        }
      })
      .returning();
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async createPresentation(insertPresentation: InsertPresentation): Promise<Presentation> {
    const [presentation] = await db.insert(presentations).values(insertPresentation).returning();
    return presentation;
  }

  async getPresentation(id: string): Promise<Presentation | undefined> {
    const result = await db.select().from(presentations).where(eq(presentations.id, id)).limit(1);
    return result[0];
  }

  async getAllPresentations(): Promise<Presentation[]> {
    return db.select().from(presentations).orderBy(desc(presentations.updatedAt));
  }

  async getPresentationsByUser(userId: string): Promise<Presentation[]> {
    return db.select()
      .from(presentations)
      .where(eq(presentations.userId, userId))
      .orderBy(desc(presentations.updatedAt));
  }

  async updatePresentation(id: string, update: Partial<InsertPresentation>): Promise<Presentation | undefined> {
    const [updated] = await db.update(presentations)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(presentations.id, id))
      .returning();
    return updated;
  }

  async deletePresentation(id: string): Promise<boolean> {
    const result = await db.delete(presentations).where(eq(presentations.id, id)).returning();
    return result.length > 0;
  }

  async createSlide(insertSlide: InsertSlide): Promise<Slide> {
    const [slide] = await db.insert(slides).values(insertSlide).returning();
    return slide;
  }

  async getSlide(id: string): Promise<Slide | undefined> {
    const result = await db.select().from(slides).where(eq(slides.id, id)).limit(1);
    return result[0];
  }

  async getSlidesByPresentation(presentationId: string): Promise<Slide[]> {
    return db.select()
      .from(slides)
      .where(eq(slides.presentationId, presentationId))
      .orderBy(slides.order);
  }

  async updateSlide(id: string, update: Partial<InsertSlide>): Promise<Slide | undefined> {
    const [updated] = await db.update(slides)
      .set(update)
      .where(eq(slides.id, id))
      .returning();
    return updated;
  }

  async deleteSlide(id: string): Promise<boolean> {
    const result = await db.delete(slides).where(eq(slides.id, id)).returning();
    return result.length > 0;
  }

  async createSession(insertSession: InsertPresentationSession): Promise<PresentationSession> {
    const [session] = await db.insert(presentationSessions).values(insertSession).returning();
    return session;
  }

  async getSession(id: string): Promise<PresentationSession | undefined> {
    const result = await db.select().from(presentationSessions).where(eq(presentationSessions.id, id)).limit(1);
    return result[0];
  }

  async getSessionByCode(code: string): Promise<PresentationSession | undefined> {
    const result = await db.select().from(presentationSessions).where(eq(presentationSessions.code, code)).limit(1);
    return result[0];
  }

  async getActiveSessionsByPresentation(presentationId: string): Promise<PresentationSession[]> {
    return db.select()
      .from(presentationSessions)
      .where(and(eq(presentationSessions.presentationId, presentationId), eq(presentationSessions.isActive, true)))
      .orderBy(desc(presentationSessions.startedAt));
  }

  async updateSession(id: string, update: Partial<Omit<InsertPresentationSession, 'presentationId' | 'code'>>): Promise<PresentationSession | undefined> {
    const [updated] = await db.update(presentationSessions)
      .set(update)
      .where(eq(presentationSessions.id, id))
      .returning();
    return updated;
  }

  async endSession(id: string): Promise<boolean> {
    const result = await db.update(presentationSessions)
      .set({ isActive: false })
      .where(eq(presentationSessions.id, id))
      .returning();
    return result.length > 0;
  }

  async createResponse(insertResponse: InsertResponse): Promise<Response> {
    const [response] = await db.insert(responses).values(insertResponse).returning();
    return response;
  }

  async getResponsesBySession(sessionId: string): Promise<Response[]> {
    return db.select()
      .from(responses)
      .where(eq(responses.sessionId, sessionId))
      .orderBy(desc(responses.submittedAt));
  }

  async getResponsesBySlide(slideId: string, sessionId: string): Promise<Response[]> {
    return db.select()
      .from(responses)
      .where(and(eq(responses.slideId, slideId), eq(responses.sessionId, sessionId)));
  }

  async createNote(insertNote: InsertNote): Promise<Note> {
    const [note] = await db.insert(notes).values(insertNote).returning();
    return note;
  }

  async getNotesByUser(userId: string): Promise<Note[]> {
    return db.select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
  }

  async getNotesBySlide(userId: string, slideId: string): Promise<Note | undefined> {
    const result = await db.select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.slideId, slideId)))
      .limit(1);
    return result[0];
  }

  async updateNote(id: string, content: string): Promise<Note | undefined> {
    const [updated] = await db.update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return updated;
  }

  async deleteNote(id: string): Promise<boolean> {
    const result = await db.delete(notes).where(eq(notes.id, id)).returning();
    return result.length > 0;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db.insert(feedback).values(insertFeedback).returning();
    return feedbackItem;
  }

  async getFeedbackBySession(sessionId: string): Promise<Feedback[]> {
    return db.select()
      .from(feedback)
      .where(eq(feedback.sessionId, sessionId))
      .orderBy(desc(feedback.submittedAt));
  }

  async getFeedbackBySlide(slideId: string, sessionId: string): Promise<Feedback[]> {
    return db.select()
      .from(feedback)
      .where(and(eq(feedback.slideId, slideId), eq(feedback.sessionId, sessionId)));
  }

  async createReaction(insertReaction: InsertReaction): Promise<Reaction> {
    const [reaction] = await db.insert(reactions)
      .values(insertReaction)
      .onConflictDoUpdate({
        target: [reactions.sessionId, reactions.slideId, reactions.participantId],
        set: {
          reactionType: insertReaction.reactionType,
          submittedAt: new Date()
        }
      })
      .returning();
    return reaction;
  }

  async getReactionsBySlide(slideId: string, sessionId: string): Promise<Reaction[]> {
    return db.select()
      .from(reactions)
      .where(and(eq(reactions.slideId, slideId), eq(reactions.sessionId, sessionId)));
  }

  async getParticipantReaction(slideId: string, sessionId: string, participantId: string): Promise<Reaction | undefined> {
    const result = await db.select()
      .from(reactions)
      .where(and(
        eq(reactions.slideId, slideId),
        eq(reactions.sessionId, sessionId),
        eq(reactions.participantId, participantId)
      ))
      .limit(1);
    return result[0];
  }

  async deleteReaction(id: string): Promise<boolean> {
    const result = await db.delete(reactions).where(eq(reactions.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DbStorage();
