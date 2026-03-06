import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/**/*.{test,spec}.{ts,tsx,mts,js,jsx,mjs}'],
    testTimeout: parseInt(process.env.MAX_EXECUTION_SECONDS || '30') * 1000,
    reporters: ['json'],
    outputFile: '/workspace/.report.json',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['@testing-library/jest-dom/vitest'],
  },
  resolve: {
    alias: {
      '@submission': path.resolve('/workspace/submission'),
      '@support': path.resolve('/workspace/support'),
    },
  },
});
