import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    // Sandbox fixtures contain intentional errors for testing:
    'src/lib/sandboxes/__fixtures__/**',
    // Sandbox runtime files (run inside Docker containers, not the Next.js app):
    'src/lib/sandboxes/shared/**',
    'src/lib/sandboxes/python/**',
    'src/lib/sandboxes/python-web/**',
    'src/lib/sandboxes/python-data-science/**',
    'src/lib/sandboxes/python-bio/**',
    'src/lib/sandboxes/sql/**',
    'src/lib/sandboxes/go/**',
    'src/lib/sandboxes/javascript/**',
    'src/lib/sandboxes/javascript-react/**',
    'src/lib/sandboxes/typescript/**',
    'src/lib/sandboxes/typescript-react/**',
    'src/lib/sandboxes/typescript-express/**',
    'src/lib/sandboxes/scripts/**',
  ]),
]);

export default eslintConfig;
