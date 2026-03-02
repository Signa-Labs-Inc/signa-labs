# Signa Labs

An AI-powered learning platform built with Next.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon serverless in production, local Docker for dev)
- **ORM**: Drizzle ORM
- **Auth**: Clerk
- **AI**: Vercel AI SDK (Anthropic, OpenAI)
- **Styling**: Tailwind CSS 4, Radix UI, CVA
- **Testing**: Vitest, React Testing Library
- **Analytics**: PostHog
- **Error Tracking**: Sentry
- **Secrets**: Doppler
- **Deployment**: Vercel
- **CI/CD**: GitHub Actions, semantic-release

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 10+
- [Docker](https://www.docker.com/) (for local PostgreSQL)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli) (for secrets management)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Signa-Labs-Inc/signa-labs.git
cd signa-labs
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up Doppler

Log in and configure the project:

```bash
doppler login
doppler setup
```

When prompted, select the `signa-labs` project and `dev` config.

### 4. Start the database

```bash
pnpm db:up
```

This starts a PostgreSQL 16 container on `localhost:5432` with:

- User: `postgres`
- Password: `postgres`
- Database: `signa`

### 5. Run database migrations

```bash
pnpm db:migrate
```

### 6. Start the dev server

```bash
pnpm dev:doppler
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Scripts

| Script               | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Start dev server (requires env vars set manually) |
| `pnpm dev:doppler`   | Start dev server with Doppler secrets             |
| `pnpm build`         | Production build                                  |
| `pnpm build:migrate` | Run migrations then build (used in Vercel)        |
| `pnpm start`         | Start production server                           |
| `pnpm lint`          | Run ESLint                                        |
| `pnpm lint:fix`      | Run ESLint with auto-fix                          |
| `pnpm format`        | Format code with Prettier                         |
| `pnpm format:check`  | Check formatting                                  |
| `pnpm typecheck`     | Run TypeScript type checking                      |
| `pnpm test`          | Run tests in watch mode                           |
| `pnpm test:run`      | Run tests once                                    |
| `pnpm test:coverage` | Run tests with coverage                           |
| `pnpm db:up`         | Start local PostgreSQL via Docker                 |
| `pnpm db:down`       | Stop local PostgreSQL                             |
| `pnpm db:push`       | Push schema changes to database                   |
| `pnpm db:generate`   | Generate migration files                          |
| `pnpm db:migrate`    | Run pending migrations                            |
| `pnpm db:studio`     | Open Drizzle Studio GUI                           |

## Environment Variables

Secrets are managed via [Doppler](https://www.doppler.com/). The following variables are required:

| Variable                            | Description                       |
| ----------------------------------- | --------------------------------- |
| `DATABASE_URL`                      | PostgreSQL connection string      |
| `NEXT_PUBLIC_POSTHOG_KEY`           | PostHog project API key           |
| `NEXT_PUBLIC_POSTHOG_HOST`          | PostHog ingest host               |
| `NEXT_PUBLIC_SENTRY_DSN`            | Sentry DSN for error tracking     |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key             |
| `CLERK_SECRET_KEY`                  | Clerk secret key                  |
| `CLERK_WEBHOOK_SIGNING_SECRET`      | Clerk webhook verification secret |

See `.env.example` for the template.

## Git Workflow

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint and Husky.

**Commit format**: `type(scope): description`

Examples:

```
feat: add user dashboard
fix: resolve login redirect loop
chore: update dependencies
```

### Git hooks

- **pre-commit**: Runs lint-staged (ESLint + Prettier) and type checking
- **commit-msg**: Validates commit message format
- **pre-push**: Runs a production build

### Releases

Releases are automated via [semantic-release](https://github.com/semantic-release/semantic-release). When commits are merged to `main`:

- `fix:` commits trigger a **patch** release (0.0.x)
- `feat:` commits trigger a **minor** release (0.x.0)
- `BREAKING CHANGE` triggers a **major** release (x.0.0)

## Project Structure

```
src/
├── app/                  # Next.js App Router pages and API routes
├── components/           # React components
│   └── ui/               # Shared UI components (Radix-based)
├── db/
│   ├── drizzle/           # Migration files
│   └── schema/            # Drizzle table schemas and relations
├── lib/
│   ├── services/          # Business logic (users, auth)
│   └── utils/             # Shared utilities and error classes
├── env.ts                # Environment variable validation
└── index.ts              # Database client initialization
```
