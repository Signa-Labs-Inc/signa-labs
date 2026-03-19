import { drizzle } from 'drizzle-orm/node-postgres';
import { contentRelations, billingRelations } from '@/db/schema/tables';

// Use TEST_DATABASE_URL exclusively — never fall back to DATABASE_URL
// to prevent accidentally connecting to production
const testDatabaseUrl =
  process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/signa_test';

export const testDb = drizzle(testDatabaseUrl, {
  relations: { ...contentRelations, ...billingRelations },
});
