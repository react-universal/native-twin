import {
  JsxEmit,
  typescriptDefaults,
} from '@codingame/monaco-vscode-standalone-typescript-language-features';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as monaco from 'monaco-editor';

export const detectLanguageFromPath = (path: string) => {
  const ext = path.replace(/^.+\.([^.]+)$/, '$1');
  if (/^[cm]?[jt]sx?$/.test(ext)) {
    return 'typescript';
  }

  return ext;
};

export const getEditorFileByURI = (uri: monaco.Uri) =>
  pipe(monaco.editor.getModel(uri), Option.fromNullable);

export const createEditorFileModel = (uri: monaco.Uri, contents: string) =>
  monaco.editor.createModel(contents, detectLanguageFromPath(uri.path) ?? 'typescript', uri);

export const pathToMonacoURI = (path: string) => monaco.Uri.parse(new URL(path, 'file:///').href);

export const getAllEditorModelFiles = () => monaco.editor.getModels();

export const getOrCreateEditorFile = (filePath: string, contents = '') => {
  const uri = pathToMonacoURI(filePath);
  return pipe(
    getEditorFileByURI(uri),
    Option.getOrElse(() => createEditorFileModel(uri, contents)),
  );
};

export const registerEditorLanguages = () => {
  monaco.languages.register({
    id: 'typescript',
    extensions: ['.ts', '.tsx'],
    aliases: ['ts', 'TS', 'tsx', 'typescriptreact'],
    mimetypes: ['text/typescript', 'text/javascript'],
  });
  monaco.languages.register({
    id: 'css',
    extensions: ['.css', '.scss'],
    aliases: ['css', 'CSS', 'sass', 'SASS'],
    mimetypes: ['text/plain', 'text/css'],
  });
  monaco.languages.register({
    id: 'html',
    extensions: ['.html', '.xhtml'],
    aliases: ['html', 'HTML', 'XHTML', 'html5'],
    mimetypes: ['text/plain', 'text/html'],
  });
  monaco.languages.register({
    id: 'json',
    extensions: ['.json'],
    mimetypes: ['text/plain', 'text/plain', 'application/json'],
  });
};

export const setTypescriptDefaults = () => {
  typescriptDefaults.setEagerModelSync(true);
  typescriptDefaults.setCompilerOptions({
    esModuleInterop: true,
    jsx: JsxEmit.Preserve,
    lib: ['Dom', 'Dom.Iterable'],
  });
};
