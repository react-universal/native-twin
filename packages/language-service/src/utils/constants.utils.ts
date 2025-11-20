import type { DocumentSelector } from 'vscode-languageserver-protocol';
import type { InternalTwinConfig } from '../twin/models/native-twin.types.js';

export const configurationSection = 'nativeTwin';

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
] satisfies DocumentSelector;


export const DEFAULT_TWIN_CONFIG = {
  content: [],
  theme: {},
  darkMode: 'class',
  ignorelist: [],
  mode: 'native',
  preflight: {},
  root: {
    rem: 16,
  },
  rules: [],
  variants: [],
  animations: [],
} as InternalTwinConfig;

// TODO: Moved to compiler
export const DEFAULT_PLUGIN_CONFIG = {
  jsxAttributes: ['tw', 'class', 'className', 'variants'],
  functions: ['tw', 'apply', 'css', 'variants', 'style', 'styled', 'createVariants'],
  debug: false,
  enable: true,
  tsConfigPath: './tsconfig.json',
  configPath: './tailwind.config.ts',
  trace: {
    server: 'off',
  } as const,
};

export const twinCommonFiles = ['tailwind.config.ts', 'twin.config.ts'];

export type NativeTwinPluginConfiguration = typeof DEFAULT_PLUGIN_CONFIG;

export const typeScriptExtensionId = 'vscode.typescript-language-features';
export const pluginId = '@native-twin/ts-plugin';
const packageName = 'native-twin-vscode';
const publisher = 'native-twin';
export const extensionChannelName = 'Native Twin Language Client';
export const extensionServerChannelName = 'Native Twin Language Server';
export const extensionName = `${publisher}.${packageName}`;
export const diagnosticProviderSource = 'NativeTwin';
