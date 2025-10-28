import { defineConfig } from './config/define-config.js';
import { convert } from './convert/convertRule.js';
import { parsedRuleToEntry } from './convert/ruleToEntry.js';
import { createTailwind } from './native-twin.js';
import { parseCssValue } from './parsers/values.parser.js';
import { cx } from './runtime/cx.js';
import { install } from './runtime/install.js';
import { observe, setup, tw } from './runtime/tw.js';
import { tx } from './runtime/tx.js';
import { createVariants } from './runtime/variants.js';
import { mutationObserver } from './runtime/web/mutation-observer.js';
import { consume, extract } from './runtime/web/ssr.js';
import { createThemeContext } from './theme/theme.context.js';
import { createThemeFunction } from './theme/theme.function.js';
import {
  matchAnimation,
  matchCssObject,
  matchThemeColor,
  matchThemeValue,
} from './theme/theme.match.js';

export type { PropsFrom } from '@native-twin/helpers';
export type { TxFunction } from './runtime/tx.js';
export type { ConfigVariants, VariantProps, VariantsConfig } from './runtime/variants.js';
/** TYPES */
export type { ExtractResult } from './runtime/web/ssr.js';
export { CompiledSheetEntry, type CompiledSheetEntryInput } from './twin/compiler.models.js';
export type * from './types/config.types.js';
export type * from './types/theme.types.js';

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

export type { TwinRuntimeContext, Units } from './runtime/runtime.context.js';
export {
  composeDeclarations,
  getSheetEntryStyles,
  sheetEntryToStyle,
  type TwinRuntimeProp,
} from './runtime/SheetHandler.js';

export {
  type ComponentStyleRegistry,
  StyleSheetAdapter,
  type StyleSheetProcessor,
} from './runtime/TwinStyleSheet.js';
