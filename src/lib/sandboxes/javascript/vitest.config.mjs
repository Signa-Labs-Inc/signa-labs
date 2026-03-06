import path from 'path';

export default {
  test: {
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts}'],
    testTimeout: parseInt(process.env.MAX_EXECUTION_SECONDS || '30') * 1000,
    reporters: ['json'],
    outputFile: '/workspace/.report.json',
  },
  resolve: {
    alias: {
      '@submission': path.resolve('/workspace/submission'),
      '@support': path.resolve('/workspace/support'),
    },
  },
};
