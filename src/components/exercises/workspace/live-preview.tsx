'use client';

import { useEffect, useRef, useState } from 'react';

// ============================================================
// Types
// ============================================================

type LivePreviewProps = {
  files: { filePath: string; content: string; isEditable: boolean }[];
  language: string;
  className?: string;
};

// ============================================================
// Constants
// ============================================================

const DEBOUNCE_MS = 500;

// ============================================================
// Code Preprocessing
// ============================================================

/**
 * Pre-process user code to work in the iframe environment:
 * - Strip import statements (dependencies are provided as globals)
 * - Convert export statements to assignments on the __exports__ object
 * - Collect export assignments and append them at the end of the code
 *   so the declarations are complete before we try to reference them
 */
function preprocessCode(code: string): string {
  const lines = code.split('\n');
  const processed: string[] = [];
  const exportedNames: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip import lines
    if (/^import\s+/.test(trimmed)) {
      continue;
    }

    // "export default function/class/const Name"
    if (/^export\s+default\s+/.test(trimmed)) {
      const match = trimmed.match(
        /^export\s+default\s+(?:const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/
      );
      if (match) {
        processed.push(line.replace(/export\s+default\s+/, ''));
        exportedNames.push(`__exports__.default = ${match[1]}`);
      } else {
        processed.push(line.replace(/export\s+default\s+/, '__exports__.default = '));
      }
      continue;
    }

    // "export const/let/var/function/class Name"
    const namedMatch = trimmed.match(
      /^export\s+(const|let|var|function|class)\s+([A-Za-z_$][A-Za-z0-9_$]*)/
    );
    if (namedMatch) {
      processed.push(line.replace(/export\s+/, ''));
      exportedNames.push(`__exports__.${namedMatch[2]} = ${namedMatch[2]}`);
      continue;
    }

    // Skip "export { ... }" re-exports
    if (/^export\s*\{/.test(trimmed)) {
      continue;
    }

    processed.push(line);
  }

  // Append export assignments at the end (after all declarations are complete)
  if (exportedNames.length > 0) {
    processed.push('');
    for (const assignment of exportedNames) {
      processed.push(`${assignment};`);
    }
  }

  return processed.join('\n');
}

// ============================================================
// HTML Builders
// ============================================================

/**
 * Build the iframe HTML for JS/TS/React exercises:
 * - React 18 + ReactDOM from CDN
 * - Tailwind CSS from CDN
 * - Babel standalone for JSX/TS transpilation
 * - Renders the first exported PascalCase component into #root
 */
function buildPreviewHtml(files: { filePath: string; content: string }[]): string {
  const mainFile = files.find(
    (f) =>
      f.filePath.endsWith('.tsx') ||
      f.filePath.endsWith('.jsx') ||
      f.filePath.endsWith('.ts') ||
      f.filePath.endsWith('.js') ||
      f.filePath.endsWith('.mjs')
  );

  const rawCode = mainFile?.content ?? '// No file to preview';
  const processedCode = preprocessCode(rawCode);
  const escapedCode = JSON.stringify(processedCode);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #ffffff;
      color: #1a1a1a;
      padding: 16px;
    }
    #root { min-height: 100px; }
    #error {
      display: none;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 8px;
      padding: 12px 16px;
      margin: 8px 0;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 13px;
      color: #dc2626;
      white-space: pre-wrap;
      word-break: break-word;
    }
    #error.visible { display: block; }
    #empty {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"><\/script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"><\/script>
  <script src="https://cdn.tailwindcss.com"><\/script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>
  <div id="empty">
    <span>Preview will appear here</span>
  </div>
  <script>
    window.onload = function() {
      var errorEl = document.getElementById('error');
      var emptyEl = document.getElementById('empty');
      var rootEl = document.getElementById('root');

      function showError(msg) {
        errorEl.textContent = msg;
        errorEl.classList.add('visible');
        emptyEl.style.display = 'none';
      }

      function clearError() {
        errorEl.textContent = '';
        errorEl.classList.remove('visible');
      }

      try {
        clearError();
        emptyEl.style.display = 'none';

        var processedCode = ${escapedCode};

        // Transpile JSX and TypeScript (imports already stripped by preprocessCode)
        var transformed = Babel.transform(processedCode, {
          presets: ['react', 'typescript'],
          filename: 'solution.tsx',
        }).code;

        // Execute with React and hooks available as globals
        var __exports__ = {};

        var moduleFunc = new Function(
          'React', 'ReactDOM', '__exports__',
          'useState', 'useEffect', 'useCallback',
          'useMemo', 'useRef', 'useContext', 'useReducer',
          transformed
        );

        moduleFunc(
          React, ReactDOM, __exports__,
          React.useState, React.useEffect, React.useCallback,
          React.useMemo, React.useRef, React.useContext, React.useReducer
        );

        // Find the component to render: default export, App, or first PascalCase function
        var Component = __exports__.default || __exports__.App;

        if (!Component) {
          var keys = Object.keys(__exports__);
          for (var i = 0; i < keys.length; i++) {
            var val = __exports__[keys[i]];
            if (typeof val === 'function' && /^[A-Z]/.test(keys[i])) {
              Component = val;
              break;
            }
          }
        }

        // Last resort: use the first export regardless of type
        if (!Component) {
          var allKeys = Object.keys(__exports__);
          if (allKeys.length > 0) {
            Component = __exports__[allKeys[0]];
          }
        }

        if (!Component) {
          emptyEl.style.display = 'flex';
          emptyEl.querySelector('span').textContent =
            'No component exported. Export a React component to see a preview.';
          return;
        }

        var root = ReactDOM.createRoot(rootEl);
        root.render(React.createElement(Component));
      } catch (err) {
        showError(err.message || String(err));
      }
    };
  <\/script>
</body>
</html>`;
}

/**
 * Build a placeholder preview for non-JS/TS languages.
 */
function buildConsolePreviewHtml(files: { filePath: string; content: string }[]): string {
  const mainFile = files.find(
    (f) => f.filePath.endsWith('.py') || f.filePath.endsWith('.go') || f.filePath.endsWith('.sql')
  );

  const lang = mainFile?.filePath.endsWith('.py')
    ? 'Python'
    : mainFile?.filePath.endsWith('.go')
      ? 'Go'
      : 'SQL';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
      background: #1f1f1f;
      color: #cccccc;
      padding: 16px;
      font-size: 13px;
      line-height: 1.6;
    }
    .hint { color: #6e7681; font-style: italic; }
  </style>
</head>
<body>
  <p class="hint">Preview is available for JavaScript, TypeScript, and React exercises.</p>
  <p class="hint">Click "Run Tests" to execute your ${lang} code.</p>
</body>
</html>`;
}

// ============================================================
// Component
// ============================================================

export function LivePreview({ files, language, className }: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [srcdoc, setSrcdoc] = useState<string>('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isWebLanguage = ['javascript', 'typescript'].includes(language);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      const editableFiles = files.filter((f) => f.isEditable);

      if (!isWebLanguage) {
        setSrcdoc(buildConsolePreviewHtml(editableFiles));
        return;
      }

      setSrcdoc(buildPreviewHtml(editableFiles));
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [files, language, isWebLanguage]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={srcdoc}
      sandbox="allow-scripts allow-same-origin"
      className={className}
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#ffffff',
      }}
      title="Live Preview"
    />
  );
}
