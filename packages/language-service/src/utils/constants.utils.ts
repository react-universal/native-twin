import type { DocumentSelector } from 'vscode-languageserver-protocol';
import type { RuleMeta } from '@native-twin/core';
import type { InternalTwinConfig } from '../native-twin/native-twin.types';

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
export const configurationSection = 'nativeTwin';

export const DEFAULT_RULE_META: RuleMeta = {
  canBeNegative: false,
  feature: 'default',
  prefix: '',
  styleProperty: undefined,
  suffix: '',
  support: [],
};

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
} as InternalTwinConfig;

export const DEFAULT_PLUGIN_CONFIG = {
  tags: ['tw', 'apply', 'css', 'variants'],
  attributes: ['tw', 'class', 'className', 'variants'],
  styles: ['style', 'styled', 'variants'],
  debug: false,
  enable: true,
  trace: {
    server: 'off',
  },
};

export type NativeTwinPluginConfiguration = typeof DEFAULT_PLUGIN_CONFIG;
