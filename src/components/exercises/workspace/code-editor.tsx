'use client';

import Editor, { type Monaco } from '@monaco-editor/react';

function handleBeforeMount(monaco: Monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    jsx: monaco.languages.typescript.JsxEmit.React,
    strict: true,
    esModuleInterop: true,
    allowJs: true,
    noEmit: true,
  });

  monaco.editor.defineTheme('dark-modern', {
    base: 'vs-dark',
    inherit: true,
    colors: {
      'editor.background': '#1f1f1f',
      'editor.foreground': '#cccccc',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorLineNumber.foreground': '#6e7681',
      'editorLineNumber.activeForeground': '#cccccc',
      'editorIndentGuide.background': '#404040',
      'editorIndentGuide.activeBackground': '#707070',
      'editorBracketMatch.background': '#0064001a',
      'editorBracketMatch.border': '#888888',
      'editor.findMatchBackground': '#9e6a03',
      'editorWidget.background': '#252526',
      'editorSuggestWidget.background': '#252526',
      'input.background': '#313131',
      'dropdown.background': '#313131',
      'list.activeSelectionBackground': '#04395e',
      'list.hoverBackground': '#2a2d2e',
      'scrollbarSlider.background': '#79797966',
      'scrollbarSlider.hoverBackground': '#646464b3',
      'scrollbarSlider.activeBackground': '#bfbfbf66',
    },
    rules: [
      { token: 'comment', foreground: '6a9955' },
      { token: 'keyword', foreground: '569cd6' },
      { token: 'keyword.control', foreground: 'c586c0' },
      { token: 'storage', foreground: '569cd6' },
      { token: 'storage.type', foreground: '569cd6' },
      { token: 'string', foreground: 'ce9178' },
      { token: 'string.escape', foreground: 'd7ba7d' },
      { token: 'number', foreground: 'b5cea8' },
      { token: 'constant', foreground: '569cd6' },
      { token: 'type', foreground: '4ec9b0' },
      { token: 'type.identifier', foreground: '4ec9b0' },
      { token: 'identifier', foreground: '9cdcfe' },
      { token: 'variable', foreground: '9cdcfe' },
      { token: 'variable.predefined', foreground: '4fc1ff' },
      { token: 'function', foreground: 'dcdcaa' },
      { token: 'function.declaration', foreground: 'dcdcaa' },
      { token: 'function.call', foreground: 'dcdcaa' },
      { token: 'method', foreground: 'dcdcaa' },
      { token: 'method.declaration', foreground: 'dcdcaa' },
      { token: 'entity.name.function', foreground: 'dcdcaa' },
      { token: 'delimiter', foreground: 'cccccc' },
      { token: 'delimiter.bracket', foreground: 'cccccc' },
      { token: 'operator', foreground: 'cccccc' },
      { token: 'tag', foreground: '569cd6' },
      { token: 'attribute.name', foreground: '9cdcfe' },
      { token: 'attribute.value', foreground: 'ce9178' },
      { token: 'regexp', foreground: 'd16969' },
      { token: 'annotation', foreground: 'dcdcaa' },
      { token: 'decorator', foreground: 'dcdcaa' },
    ],
  });
}

const FILE_EXTENSION_MAP: Record<string, string> = {
  python: 'py',
  typescript: 'tsx',
  javascript: 'jsx',
  go: 'go',
  ruby: 'rb',
  sql: 'sql',
};

type CodeEditorProps = {
  value: string;
  language: string;
  filePath?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
};

export function CodeEditor({
  value,
  language,
  filePath,
  readOnly = false,
  onChange,
}: CodeEditorProps) {
  const ext = FILE_EXTENSION_MAP[language] ?? language;
  console.log(filePath);
  const modelPath = filePath ?? `file:///exercise.${ext}`;

  return (
    <Editor
      height="100%"
      language={language}
      path={modelPath}
      value={value}
      onChange={(val) => onChange(val ?? '')}
      theme="dark-modern"
      beforeMount={handleBeforeMount}
      options={{
        readOnly,
        minimap: { enabled: true },
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
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        cursorStyle: 'line',
        bracketPairColorization: { enabled: true },
        guides: { bracketPairs: false, indentation: true },
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: true,
        quickSuggestions: { other: true, comments: false, strings: false },
        parameterHints: { enabled: true },
        formatOnPaste: true,
        formatOnType: true,
        smoothScrolling: true,
        fontLigatures: true,
        fontFamily:
          "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Menlo, Monaco, 'Courier New', monospace",
        renderWhitespace: 'selection',
        linkedEditing: true,
        stickyScroll: { enabled: true },
        'semanticHighlighting.enabled': true,
      }}
    />
  );
}
