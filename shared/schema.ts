import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const presentations = pgTable("presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slideTypeEnum = z.enum(["multiple_choice", "word_cloud", "open_ended", "heading"]);
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

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presentationId: varchar("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 6 }).notNull().unique(),
  currentSlideIndex: integer("current_slide_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

export const responses = pgTable("responses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  slideId: varchar("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id").notNull(),
  answer: text("answer").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

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

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  startedAt: true,
  code: true,
  currentSlideIndex: true,
  isActive: true,
});

export const insertResponseSchema = createInsertSchema(responses).omit({
  id: true,
  submittedAt: true,
});

export type InsertPresentation = z.infer<typeof insertPresentationSchema>;
export type Presentation = typeof presentations.$inferSelect;

export type InsertSlide = z.infer<typeof insertSlideSchema>;
export type Slide = typeof slides.$inferSelect;

export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;

export type InsertResponse = z.infer<typeof insertResponseSchema>;
export type Response = typeof responses.$inferSelect;
