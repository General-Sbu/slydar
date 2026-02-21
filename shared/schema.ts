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

export const onboardingChecklistSchema = z.object({
  createdFirstPresentation: z.boolean().default(false),
  addedFirstSlide: z.boolean().default(false),
  startedFirstSession: z.boolean().default(false),
  invitedFirstParticipant: z.boolean().default(false),
  viewedAnalytics: z.boolean().default(false),
  exploredTemplates: z.boolean().default(false),
});

export type OnboardingChecklist = z.infer<typeof onboardingChecklistSchema>;

export const defaultOnboardingChecklist: OnboardingChecklist = {
  createdFirstPresentation: false,
  addedFirstSlide: false,
  startedFirstSession: false,
  invitedFirstParticipant: false,
  viewedAnalytics: false,
  exploredTemplates: false,
};

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username").unique(),
  password: varchar("password"),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
  onboardingChecklist: jsonb("onboarding_checklist").$type<OnboardingChecklist>().default(defaultOnboardingChecklist),
  useCase: varchar("use_case"),
  explorationGoal: varchar("exploration_goal"),
  organizationSize: varchar("organization_size"),
  role: varchar("role"),
  industry: varchar("industry"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const onboardingAnalytics = pgTable("onboarding_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stepName: varchar("step_name").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  timeSpentSeconds: integer("time_spent_seconds"),
});

export const templateColorScheme = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  text: z.string(),
  textMuted: z.string(),
});

export type TemplateColorScheme = z.infer<typeof templateColorScheme>;

export const templateCategoryEnum = z.enum(["polls", "quizzes", "feedback", "icebreakers", "education", "business", "general"]);
export type TemplateCategory = z.infer<typeof templateCategoryEnum>;

export const templateSlideSchema = z.object({
  type: z.string(),
  title: z.string().optional(),
  question: z.string().optional(),
  options: z.array(z.string()).optional(),
  config: z.object({
    elements: z.array(z.any()).default([]),
    background: z.string().optional(),
    spinnerEntries: z.array(z.object({
      id: z.string(),
      label: z.string(),
      color: z.string(),
    })).optional(),
  }).optional(),
});

export type TemplateSlide = z.infer<typeof templateSlideSchema>;

export const templates = pgTable("templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"),
  colorScheme: jsonb("color_scheme").$type<TemplateColorScheme>().notNull(),
  slides: jsonb("slides").$type<TemplateSlide[]>().default([]),
  thumbnail: text("thumbnail"),
  featured: boolean("featured").default(false).notNull(),
  usageCount: integer("usage_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const presentations = pgTable("presentations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  templateId: varchar("template_id").references(() => templates.id),
  published: boolean("published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const slideTypeEnum = z.enum(["multiple_choice", "word_cloud", "open_ended", "heading", "image", "spinner", "fill_blank", "select_answer", "puzzle", "type_answer", "match_pair", "leaderboard", "poll", "q_a", "whiteboard"]);
export type SlideType = z.infer<typeof slideTypeEnum>;

export const fillBlankQuestionSchema = z.object({
  id: z.string(),
  sentence: z.string(),
  blanks: z.array(z.object({
    answer: z.string(),
  })),
});
export type FillBlankQuestion = z.infer<typeof fillBlankQuestionSchema>;

export const spinnerEntrySchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string(),
});
export type SpinnerEntry = z.infer<typeof spinnerEntrySchema>;

export const defaultSpinnerEntries: SpinnerEntry[] = [
  { id: "1", label: "Entry 1", color: "#9333EA" },
  { id: "2", label: "Entry 2", color: "#DC2626" },
  { id: "3", label: "Entry 3", color: "#EA580C" },
  { id: "4", label: "Entry 4", color: "#EAB308" },
  { id: "5", label: "Entry 5", color: "#22C55E" },
  { id: "6", label: "Entry 6", color: "#14B8A6" },
  { id: "7", label: "Entry 7", color: "#3B82F6" },
  { id: "8", label: "Entry 8", color: "#1E3A8A" },
];

export const imageElementSchema = z.object({
  type: z.literal("image"),
  id: z.string(),
  src: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(1).max(100),
  height: z.number().min(1).max(100),
  zIndex: z.number().default(1),
});

export const textElementSchema = z.object({
  type: z.literal("text"),
  id: z.string(),
  content: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(10).max(100),
  fontSize: z.number().min(12).max(200).default(32),
  fontWeight: z.enum(["normal", "bold"]).default("normal"),
  fontStyle: z.enum(["normal", "italic"]).default("normal"),
  textDecoration: z.enum(["none", "underline", "line-through"]).default("none"),
  fontFamily: z.enum(["Inter", "Helvetica", "Arial", "Georgia", "Times New Roman", "Courier New"]).default("Inter"),
  textAlign: z.enum(["left", "center", "right"]).default("left"),
  color: z.string().optional(),
  rotation: z.number().min(0).max(360).default(0),
  zIndex: z.number().default(1),
});

export const slideElementSchema = z.discriminatedUnion("type", [
  imageElementSchema,
  textElementSchema,
]);

export type SlideElement = z.infer<typeof slideElementSchema>;
export type ImageElement = z.infer<typeof imageElementSchema>;
export type TextElement = z.infer<typeof textElementSchema>;

export const slideConfigSchema = z.object({
  elements: z.array(slideElementSchema).default([]),
  background: z.string().optional(),
  spinnerEntries: z.array(spinnerEntrySchema).optional(),
  fillBlankQuestions: z.array(fillBlankQuestionSchema).optional(),
}).passthrough();

export type SlideConfig = z.infer<typeof slideConfigSchema>;

export const slides = pgTable("slides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presentationId: varchar("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  order: integer("order").notNull(),
  title: text("title"),
  question: text("question"),
  options: text("options").array(),
  config: jsonb("config").$type<SlideConfig>().default({ elements: [] }),
});

export const presentationSessions = pgTable("presentation_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  presentationId: varchar("presentation_id").notNull().references(() => presentations.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 6 }).notNull().unique(),
  currentSlideIndex: integer("current_slide_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  allowDownload: boolean("allow_download").notNull().default(false),
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

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => presentationSessions.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id").notNull(),
  question: text("question").notNull(),
  upvotes: integer("upvotes").notNull().default(0),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const questionVotes = pgTable("question_votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  questionId: varchar("question_id").notNull().references(() => questions.id, { onDelete: "cascade" }),
  participantId: varchar("participant_id").notNull(),
  votedAt: timestamp("voted_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("idx_question_votes_unique").on(table.questionId, table.participantId)
]);

// Annotation schemas for drawing tools
export const annotationToolTypeEnum = z.enum(["pen", "highlighter", "eraser", "rectangle", "circle", "arrow", "line", "text"]);
export type AnnotationToolType = z.infer<typeof annotationToolTypeEnum>;

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const pathAnnotationSchema = z.object({
  type: z.enum(["pen", "highlighter", "eraser"]),
  id: z.string(),
  points: z.array(pointSchema),
  color: z.string(),
  strokeWidth: z.number(),
});

export const shapeAnnotationSchema = z.object({
  type: z.enum(["rectangle", "circle", "arrow", "line"]),
  id: z.string(),
  startX: z.number(),
  startY: z.number(),
  endX: z.number(),
  endY: z.number(),
  color: z.string(),
  strokeWidth: z.number(),
  fillColor: z.string().optional(),
});

export const textAnnotationSchema = z.object({
  type: z.literal("text"),
  id: z.string(),
  content: z.string(),
  x: z.number(),
  y: z.number(),
  color: z.string(),
  fontSize: z.number(),
});

export const annotationDataSchema = z.discriminatedUnion("type", [
  pathAnnotationSchema,
  shapeAnnotationSchema,
  textAnnotationSchema,
]);

export type AnnotationData = z.infer<typeof annotationDataSchema>;
export type PathAnnotation = z.infer<typeof pathAnnotationSchema>;
export type ShapeAnnotation = z.infer<typeof shapeAnnotationSchema>;
export type TextAnnotation = z.infer<typeof textAnnotationSchema>;

export const annotations = pgTable("annotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => presentationSessions.id, { onDelete: "cascade" }),
  slideId: varchar("slide_id").notNull().references(() => slides.id, { onDelete: "cascade" }),
  data: jsonb("data").$type<AnnotationData>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPresentationSchema = createInsertSchema(presentations).omit({
  id: true,
  published: true,
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

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  upvotes: true,
  submittedAt: true,
});

export const insertQuestionVoteSchema = createInsertSchema(questionVotes).omit({
  id: true,
  votedAt: true,
});

export const insertAnnotationSchema = createInsertSchema(annotations).omit({
  id: true,
  createdAt: true,
}).extend({
  data: annotationDataSchema,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateOnboardingSchema = z.object({
  useCase: z.string().optional(),
  explorationGoal: z.string().optional(),
  organizationSize: z.string().optional(),
  role: z.string().optional(),
  industry: z.string().optional(),
  onboardingComplete: z.boolean().optional(),
});

export const registerSchema = insertUserSchema.extend({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional().or(z.literal('')),
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

export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questions.$inferSelect;

export type InsertQuestionVote = z.infer<typeof insertQuestionVoteSchema>;
export type QuestionVote = typeof questionVotes.$inferSelect;

export type InsertAnnotation = z.infer<typeof insertAnnotationSchema>;
export type Annotation = typeof annotations.$inferSelect;

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
}).extend({
  colorScheme: templateColorScheme,
});

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export * from "./models/chat";
