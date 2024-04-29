import { RuleMeta } from '@native-twin/core';
import { InternalTwinConfig } from '../native-twin/native-twin.models';

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
