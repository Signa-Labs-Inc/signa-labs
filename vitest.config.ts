import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: [
            'node_modules',
            '**/*.integration.test.ts',
            'src/e2e/**',
            'src/lib/sandboxes/__fixtures__/**',
            'src/lib/sandboxes/execution_clients/tests/**',
          ],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          globals: true,
          setupFiles: ['./src/test/setup.integration.ts'],
          include: ['src/**/*.integration.test.ts'],
          pool: 'forks',
          fileParallelism: false,
          testTimeout: 15000,
        },
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './src'),
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
