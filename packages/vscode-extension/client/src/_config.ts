import { LanguageClientOptions } from 'vscode-languageclient';

export const SUPPORTED_LANGUAGES: Exclude<
  LanguageClientOptions['documentSelector'],
  undefined
> = [
  { scheme: 'file', language: 'typescript' },
  { scheme: 'file', language: 'typescriptreact' },
  { scheme: 'file', language: 'javascript' },
  { scheme: 'file', language: 'javascriptreact' },
];
