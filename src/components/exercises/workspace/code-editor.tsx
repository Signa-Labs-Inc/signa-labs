// src/components/workspace/code-editor.tsx
'use client';

import Editor from '@monaco-editor/react';

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  python: 'python',
  typescript: 'typescript',
  javascript: 'javascript',
  go: 'go',
  ruby: 'ruby',
  sql: 'sql',
};

type CodeEditorProps = {
  value: string;
  language: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
};

export function CodeEditor({ value, language, readOnly = false, onChange }: CodeEditorProps) {
  return (
    <Editor
      height="100%"
      language={MONACO_LANGUAGE_MAP[language] ?? language}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="vs-dark"
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 22,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        tabSize: 2,
        automaticLayout: true,
        renderLineHighlight: 'gutter',
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
    />
  );
}
