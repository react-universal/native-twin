export const typeScriptExtensionId = 'vscode.typescript-language-features';
export const pluginId = '@universal-labs/native-twin-ts-plugin';
export const configurationSection = 'nativeTailwind';
const packageName = '@universal-labs/native-twin-vscode';
const publisher = 'universal-labs';
export const extensionChannelName = 'Native Tailwind IntelliSense';
export const extensionName = `${publisher}.${packageName}`;

export const DOCUMENT_SELECTORS = [
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
