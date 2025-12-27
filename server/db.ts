import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

const getDatabaseUrl = () => {
  // Prefer DATABASE_URL (Replit built-in database) over individual PG* variables
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  if (process.env.PGHOST) {
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}?sslmode=require`;
  }
  throw new Error('Database credentials not found');
};

const sql = neon(getDatabaseUrl());
export const db = drizzle(sql, { schema });
