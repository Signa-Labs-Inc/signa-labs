# Secrets Management

This project uses [Doppler](https://doppler.com) for secrets management.

## For New Team Members

### 1. Install Doppler CLI

```bash
# macOS
brew install dopplerhq/cli/doppler

# Linux
curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | sudo gpg --dearmor -o /usr/share/keyrings/doppler-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/doppler-archive-keyring.gpg] https://packages.doppler.com/public/cli/deb/debian any-version main" | sudo tee /etc/apt/sources.list.d/doppler-cli.list
sudo apt update && sudo apt install doppler

# Windows
scoop install doppler
```

### 2. Authenticate

```bash
doppler login
```

### 3. Set Up Project

```bash
# In the project directory
doppler setup
# Select: signa-labs → dev (for local development)
```

### 4. Run the App

**Option A: Inject secrets at runtime (recommended)**

```bash
doppler run -- pnpm dev
```

**Option B: Download to .env.local**

```bash
doppler secrets download --no-file --format env > .env.local
pnpm dev
```

## Environments

| Environment | Doppler Config | Used For              |
| ----------- | -------------- | --------------------- |
| Development | `dev`          | Local development     |
| Staging     | `stg`          | Preview deployments   |
| Production  | `prd`          | Production deployment |

## Adding New Secrets

1. Go to [Doppler Dashboard](https://dashboard.doppler.com)
2. Select `signa-labs` project
3. Choose the appropriate environment
4. Add the secret
5. Sync to other environments if needed

## CI/CD Integration

GitHub Actions and Vercel pull secrets directly from Doppler via service tokens.
See the Doppler dashboard for integration setup.

## Required Secrets

| Secret                     | Description                 |
| -------------------------- | --------------------------- |
| `NEXT_PUBLIC_POSTHOG_KEY`  | PostHog analytics key       |
| `NEXT_PUBLIC_POSTHOG_HOST` | PostHog API host            |
| `NEXT_PUBLIC_SENTRY_DSN`   | Sentry error tracking DSN   |
| `SENTRY_AUTH_TOKEN`        | Sentry auth token (CI only) |
