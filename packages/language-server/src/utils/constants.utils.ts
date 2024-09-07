import type { DocumentSelector } from 'vscode-languageserver-protocol';
import { RuleMeta } from '@native-twin/core';
import { InternalTwinConfig } from '@native-twin/language-service';
import { presetTailwind } from '@native-twin/preset-tailwind';
import { NativeTwinPluginConfiguration } from '../types/extension.types';

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
  presets: [presetTailwind()],
  animations: [],
} as InternalTwinConfig;

export const DEFAULT_PLUGIN_CONFIG: NativeTwinPluginConfiguration = {
  tags: ['tw', 'apply', 'css', 'variants'],
  attributes: ['tw', 'class', 'className', 'variants'],
  styles: ['style', 'styled', 'variants'],
  debug: false,
  enable: true,
  trace: {
    server: 'off',
  },
};
