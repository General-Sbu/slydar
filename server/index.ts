import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { seedTemplates } from "./seed-templates";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use('/uploads', express.static(join(__dirname, '../public/uploads')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize database tables
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES presentation_sessions(id) ON DELETE CASCADE,
        slide_id VARCHAR NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
        participant_id VARCHAR NOT NULL,
        content TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        slide_id VARCHAR NOT NULL REFERENCES slides(id) ON DELETE CASCADE,
        session_id VARCHAR NOT NULL REFERENCES presentation_sessions(id) ON DELETE CASCADE,
        participant_id VARCHAR NOT NULL,
        reaction_type TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reactions_unique 
      ON reactions(session_id, slide_id, participant_id);
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS questions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR NOT NULL REFERENCES presentation_sessions(id) ON DELETE CASCADE,
        participant_id VARCHAR NOT NULL,
        question TEXT NOT NULL,
        upvotes INTEGER NOT NULL DEFAULT 0,
        submitted_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS question_votes (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id VARCHAR NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        participant_id VARCHAR NOT NULL,
        voted_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    await db.execute(sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_question_votes_unique 
      ON question_votes(question_id, participant_id);
    `);
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        color_scheme JSONB NOT NULL,
        thumbnail TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='presentations' AND column_name='template_id'
        ) THEN
          ALTER TABLE presentations ADD COLUMN template_id VARCHAR REFERENCES templates(id);
        END IF;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='exploration_goal'
        ) THEN
          ALTER TABLE users ADD COLUMN exploration_goal VARCHAR;
        END IF;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='slides' AND column_name='title'
        ) THEN
          ALTER TABLE slides ADD COLUMN title TEXT;
        END IF;
      END $$;
    `);
    
    // Add template category and slides columns
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='templates' AND column_name='category'
        ) THEN
          ALTER TABLE templates ADD COLUMN category TEXT DEFAULT 'general' NOT NULL;
        END IF;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='templates' AND column_name='slides'
        ) THEN
          ALTER TABLE templates ADD COLUMN slides JSONB DEFAULT '[]';
        END IF;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='templates' AND column_name='featured'
        ) THEN
          ALTER TABLE templates ADD COLUMN featured BOOLEAN DEFAULT false NOT NULL;
        END IF;
      END $$;
    `);
    
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='templates' AND column_name='usage_count'
        ) THEN
          ALTER TABLE templates ADD COLUMN usage_count INTEGER DEFAULT 0 NOT NULL;
        END IF;
      END $$;
    `);
    
    // Add onboarding checklist to users
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='onboarding_checklist'
        ) THEN
          ALTER TABLE users ADD COLUMN onboarding_checklist JSONB DEFAULT '{"createdFirstPresentation":false,"addedFirstSlide":false,"startedFirstSession":false,"invitedFirstParticipant":false,"viewedAnalytics":false,"exploredTemplates":false}';
        END IF;
      END $$;
    `);
    
    // Create onboarding_analytics table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS onboarding_analytics (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        step_name VARCHAR NOT NULL,
        completed_at TIMESTAMP DEFAULT now() NOT NULL,
        time_spent_seconds INTEGER
      );
    `);
    
    log('✅ Database tables initialized');
    
    await seedTemplates();
  } catch (error) {
    log('⚠️ Database initialization warning: ' + (error instanceof Error ? error.message : String(error)));
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
