import 'dotenv/config';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzlePG } from 'drizzle-orm/node-postgres';
import { contentRelations, billingRelations } from './db/schema/tables';
import { env } from './env';
import { Pool } from '@neondatabase/serverless';

function createDB() {
  if (env.NODE_ENV === 'production') {
    const pool = new Pool({ connectionString: env.DATABASE_URL });
    return drizzleNeon({ client: pool, relations: { ...contentRelations, ...billingRelations } });
  } else {
    return drizzlePG(env.DATABASE_URL, {
      relations: { ...contentRelations, ...billingRelations },
    });
  }
}

export const db = createDB();
