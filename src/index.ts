import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { contentRelations, billingRelations } from './db/schema/tables';

export const db = drizzle(process.env.DATABASE_URL!, {
  relations: { ...contentRelations, ...billingRelations },
});
