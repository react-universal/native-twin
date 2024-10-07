import * as monaco from 'monaco-editor';

export const workspacePrefix = 'file:///';

export function detectLanguage(path: string) {
  const ext = path.replace(/^.+\.([^.]+)$/, '$1');

  if (/^[cm]?[jt]sx?$/.test(ext)) {
    return 'typescript';
  }

  return ext;
}

export function getOrCreateModel(path: string, defaultValue = '') {
  const uri = monaco.Uri.parse(new URL(path, workspacePrefix).href);

  return (
    monaco.editor.getModel(uri) ||
    monaco.editor.createModel(defaultValue, detectLanguage(path) ?? 'typescript', uri)
  );
}
