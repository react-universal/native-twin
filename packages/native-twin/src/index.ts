import { defineConfig } from './config/define-config';
import { convert } from './convert/convertRule';
import { parsedRuleToEntry } from './convert/ruleToEntry';
import { createTailwind } from './native-twin';
import { parseCssValue } from './parsers/values.parser';
import { cx } from './runtime/cx';
import { install } from './runtime/install';
import { mutationObserver } from './runtime/mutation-observer';
import { consume, extract } from './runtime/ssr';
import { tw, setup, observe } from './runtime/tw';
import { tx } from './runtime/tx';
import { createVariants } from './runtime/variants';
import { createThemeContext } from './theme/theme.context';
import { createThemeFunction } from './theme/theme.function';
import {
  matchCssObject,
  matchThemeColor,
  matchThemeValue,
  matchAnimation,
} from './theme/theme.match';

/** TYPES */
export type { ExtractResult } from './runtime/ssr';
export type { TxFunction } from './runtime/tx';
export type { ConfigVariants, VariantProps, VariantsConfig } from './runtime/variants';
export type * from './types/config.types';
export type * from './types/theme.types';
export type { PropsFrom } from '@native-twin/helpers';

export {
  tw,
  tx,
  cx,
  parseCssValue,
  createThemeContext,
  createThemeFunction,
  matchCssObject,
  matchThemeColor,
  matchThemeValue,
  matchAnimation,
  createVariants,
  createTailwind,
  install,
  setup,
  observe,
  consume,
  extract,
  mutationObserver,
  parsedRuleToEntry,
  convert,
  defineConfig,
};
