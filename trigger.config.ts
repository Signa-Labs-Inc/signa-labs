import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: 'proj_mtreuhjzetkcydpgdeyc',
  runtime: 'node',
  logLevel: 'log',
  maxDuration: 300,
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 1,
    },
  },
  dirs: ['./src/trigger'],
});
