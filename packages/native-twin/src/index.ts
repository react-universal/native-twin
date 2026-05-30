import { defineConfig } from './config/define-config';
import { convert } from './convert/convertRule';
import { parsedRuleToEntry } from './convert/ruleToEntry';
import { createTailwind } from './native-twin';
import { parseCssValue } from './parsers/values.parser';
import { cx } from './runtime/cx';
import { install } from './runtime/install';
import { observe, setup, tw } from './runtime/tw';
import { tx } from './runtime/tx';
import { createVariants } from './runtime/variants';
import { mutationObserver } from './runtime/web/mutation-observer';
import { consume, extract } from './runtime/web/ssr';
import { createThemeContext } from './theme/theme.context';
import { createThemeFunction } from './theme/theme.function';
import {
  matchAnimation,
  matchCssObject,
  matchThemeColor,
  matchThemeValue,
} from './theme/theme.match';

export type { PropsFrom } from '@native-twin/helpers';
export type { TwinRuntimeContext, Units } from './runtime/runtime.context';
export {
  composeDeclarations,
  getSheetEntryStyles,
  sheetEntryToStyle,
  type TwinRuntimeProp,
} from './runtime/SheetHandler';
export type {
  ClassnameStyles,
  ComponentStyleRegistry,
  ReadClassNameProp,
  TwinComponentStyleProp,
} from './runtime/sheet/Models';
export { StyleSheetAdapter } from './runtime/TwinStyleSheet';
export type { TxFunction } from './runtime/tx';
export type { ConfigVariants, VariantProps, VariantsConfig } from './runtime/variants';
/** TYPES */
export type { ExtractResult } from './runtime/web/ssr';
export { CompiledSheetEntry, type CompiledSheetEntryInput } from './twin/compiler.models';
export { __defaultRuleMeta } from './twin/constants';
export type { TWScreenValueConfig } from './twin/parser/twin.tokens';
export {
  BABEL_JSX_PLUGIN_IMPORT_RUNTIME,
  commonMappedAttribute,
  createCommonMappedAttribute,
  type MappedComponent,
  mappedComponents,
  type NativeTwinPluginConfiguration,
  TWIN_DEFAULT_FILES,
  TWIN_DEFAULT_PLUGIN_CONFIG,
} from './twin/reactNative.constants';
export type * from './types/config.types';
export type * from './types/theme.types';
export {
  consume,
  convert,
  createTailwind,
  createThemeContext,
  createThemeFunction,
  createVariants,
  cx,
  defineConfig,
  extract,
  install,
  matchAnimation,
  matchCssObject,
  matchThemeColor,
  matchThemeValue,
  mutationObserver,
  observe,
  parseCssValue,
  parsedRuleToEntry,
  setup,
  tw,
  tx,
};
