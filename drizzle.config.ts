import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { z } from 'zod';

const { DATABASE_URL } = z.object({ DATABASE_URL: z.string().min(1) }).parse(process.env);

export default defineConfig({
  out: './src/db/drizzle',
  schema: './src/db/schema/tables/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: DATABASE_URL,
  },
});
