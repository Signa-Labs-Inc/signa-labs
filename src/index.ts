import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { contentRelations, billingRelations } from './db/schema/tables';
import { env } from './env';

export const db = drizzle(env.DATABASE_URL!, {
  relations: { ...contentRelations, ...billingRelations },
});
