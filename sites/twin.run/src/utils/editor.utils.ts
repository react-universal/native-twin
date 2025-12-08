import { LogLevel } from 'vscode';
import {
  JsxEmit,
  typescriptDefaults,
} from '@codingame/monaco-vscode-standalone-typescript-language-features';
import * as monaco from 'monaco-editor';
import { ConsoleLogger } from 'monaco-languageclient/common';

const uiLogger = new ConsoleLogger(LogLevel.Off);

export const debugLogging = (id: string) => {
  const now = new Date(Date.now());
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
  uiLogger.debug(`[${hours}:${minutes}:${seconds}.${milliseconds}]: ${id}`);
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
