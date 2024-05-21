import { RuleMeta } from '@native-twin/core';
import { InternalTwinConfig } from '../native-twin/native-twin.types';
import { NativeTwinPluginConfiguration } from '../types/extension.types';

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
