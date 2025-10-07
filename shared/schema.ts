import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth sessions table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique().notNull(),
  password: varchar("password").notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const presentations = pgTable("presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slideTypeEnum = z.enum(["multiple_choice", "word_cloud", "open_ended", "heading", "image"]);
export type SlideType = z.infer<typeof slideTypeEnum>;

export const slides = pgTable("slides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presentationId: varchar("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  order: integer("order").notNull(),
  question: text("question"),
  options: text("options").array(),
  config: jsonb("config").$type<Record<string, any>>(),
});

export const presentationSessions = pgTable("presentation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presentationId: varchar("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 6 }).notNull().unique(),
  currentSlideIndex: integer("current_slide_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => presentationSessions.id, { onDelete: "cascade" }),
  slideId: varchar("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id").notNull(),
  answer: text("answer").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  slideId: varchar("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  presentationId: varchar("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => presentationSessions.id, { onDelete: "cascade" }),
  slideId: varchar("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id").notNull(),
  content: text("content").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const reactionTypeEnum = z.enum(["like", "heart", "thumbs_down"]);
export type ReactionType = z.infer<typeof reactionTypeEnum>;

export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slideId: varchar("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  sessionId: varchar("session_id").notNull().references(() => presentationSessions.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id").notNull(),
  reactionType: text("reaction_type").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_reactions_unique").on(table.sessionId, table.slideId, table.participantId)
]);

export const insertPresentationSchema = createInsertSchema(presentations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSlideSchema = createInsertSchema(slides).omit({
  id: true,
}).extend({
  type: slideTypeEnum,
});

export const insertPresentationSessionSchema = createInsertSchema(presentationSessions).omit({
  id: true,
  startedAt: true,
}).extend({
  code: z.string().min(6).max(6),
  currentSlideIndex: z.number().default(0),
  isActive: z.boolean().default(true),
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  submittedAt: true,
});

export const insertNoteSchema = createInsertSchema(notes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  submittedAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  submittedAt: true,
}).extend({
  reactionType: reactionTypeEnum,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const registerSchema = insertUserSchema.extend({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional(),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = Omit<typeof users.$inferSelect, 'password'>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type Presentation = typeof presentations.$inferSelect;

export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type Slide = typeof slides.$inferSelect;

export type InsertPresentationSession = z.infer<typeof insertPresentationSessionSchema>;
export type PresentationSession = typeof presentationSessions.$inferSelect;

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;

export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;

export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;

export type InsertReaction = z.infer<typeof insertReactionSchema>;
export type Reaction = typeof reactions.$inferSelect;
