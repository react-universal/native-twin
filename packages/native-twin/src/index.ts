/** RUNTIME */
export { createTailwind } from './native-twin';
export { cx } from './runtime/cx';
export { install } from './runtime/install';
export { type ExtractResult, consume, extract } from './runtime/ssr';
export { setup, tw, observe } from './runtime/tw';
export { type TxFunction, tx } from './runtime/tx';
export { mutationObserver } from './runtime/mutation-observer';
export {
  type ConfigVariants,
  type VariantProps,
  type VariantsConfig,
  createVariants,
} from './runtime/variants';

/** CSS */
export { parsedRuleToEntry } from './convert/ruleToEntry';
export { convert } from './convert/convertRule';

/** CONFIG */
export { defineConfig } from './config/define-config';

/** THEME */
export { createThemeContext } from './theme/theme.context';
export { createThemeFunction } from './theme/theme.function';
export {
  matchCssObject,
  matchThemeColor,
  matchThemeValue,
  matchAnimation,
} from './theme/theme.match';

// PARSERS
export { parseCssValue } from './parsers/values.parser';

/** TYPES */
export type * from './types/config.types';
export type * from './types/theme.types';
export type { PropsFrom } from '@native-twin/helpers';
