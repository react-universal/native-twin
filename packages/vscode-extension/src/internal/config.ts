import { DocumentSelector } from 'vscode-languageclient/node';

export const typeScriptExtensionId = 'vscode.typescript-language-features';
export const pluginId = '@native-twin/ts-plugin';
export const configurationSection = 'nativeTwin';
const packageName = '@native-twin/vscode';
const publisher = 'native-twin';
export const extensionChannelName = 'Native Tailwind IntelliSense';
export const extensionName = `${publisher}.${packageName}`;

export const DOCUMENT_SELECTORS: DocumentSelector = [
  {
    scheme: 'file',
    language: 'typescript',
  },
  {
    scheme: 'file',
    language: 'typescriptreact',
  },
  {
    scheme: 'file',
    language: 'javascript',
  },
  {
    scheme: 'file',
    language: 'javascriptreact',
  },
];
