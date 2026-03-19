---
name: use-package-scripts
description: Always use package.json scripts (via pnpm) for db/build/dev commands instead of raw npx commands. Uses doppler for env vars.
type: feedback
---

When running project commands (db migrations, builds, dev server, etc.), always use the scripts defined in package.json via pnpm. The project uses Doppler for environment variable management.

Key scripts:

- `pnpm db:generate` — generates drizzle migrations (uses `doppler run -- drizzle-kit generate`)
- `pnpm db:migrate` — runs migrations (uses `doppler run -- drizzle-kit migrate`)
- `pnpm db:push` — pushes schema to DB
- `pnpm db:studio` — opens drizzle studio
- `pnpm dev` — starts dev server with trigger.dev
- `pnpm build` — production build
- `pnpm typecheck` — TypeScript type check

Never use raw `npx drizzle-kit` or pass dummy DATABASE_URL values.
