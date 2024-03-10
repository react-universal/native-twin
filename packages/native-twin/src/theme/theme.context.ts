import type { ParsedRule } from '@universal-labs/css';
import { parsedRuleToClassName } from '../convert/ruleToClassName';
import { createRuleResolver } from '../parsers/rule-handler';
import { createVariantResolver } from '../parsers/variant-handler';
import type {
  RuleResult,
  TailwindConfig,
  ThemeContext,
  Variant,
  VariantResult,
} from '../types/config.types';
import type { SheetEntry } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
import type { MaybeArray } from '../types/util.types';
import { flattenColorPalette } from '../utils/theme-utils';
import { createThemeFunction } from './theme.function';

interface RuleHandlerFn<Theme extends __Theme__ = __Theme__> {
  (token: ParsedRule, ctx: ThemeContext<Theme>): RuleResult;
}

interface VariantHandlerFn<Theme extends __Theme__ = __Theme__> {
  (token: string, ctx: ThemeContext<Theme>): VariantResult;
}

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
  mode,
  variants = [],
}: TailwindConfig<Theme>): ThemeContext<Theme> {
  const variantCache = new Map<string, MaybeArray<string>>();
  const variantsHandlers = new Map<Variant<Theme>, VariantHandlerFn<Theme>>();
  const ruleHandlers = new Map<string, RuleHandlerFn<Theme>>();
  const rulesCache = new Map<string, SheetEntry>();
  // const ignoredRules = new Set<string>();
  // const isIgnoredRule = (rule: ParsedRule) => {
  //   if (ignoredRules.has(rule.n)) return true;
  //   return ignorelist.some((x) => x.startsWith(rule.n));
  // };
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    theme: createThemeFunction(themeConfig),

    get breakpoints() {
      return Object.assign(themeConfig.screens ?? {}, themeConfig.extend?.screens);
    },

    get mode() {
      return mode;
    },

    v(value) {
      if (variantCache.has(value)) {
        return variantCache.get(value);
      }

      for (const current of variants) {
        let handler = variantsHandlers.get(current);
        if (!handler) {
          handler = createVariantResolver(current);
          variantsHandlers.set(current, handler);
        }
        const nextToken = handler(value, ctx);
        if (nextToken) {
          variantCache.set(value, nextToken);
          return nextToken;
        }
      }
      variantCache.set(value, '&:' + value);
      return variantCache.get(value);
    },

    r(token: ParsedRule) {
      for (const current of rules) {
        const className = parsedRuleToClassName(token);

        if (rulesCache.has(className)) {
          return rulesCache.get(className);
        }
        const key = JSON.stringify(
          current.filter((x) => typeof x !== 'function' && typeof x !== 'object'),
        );
        let handler = ruleHandlers.get(key);

        if (!handler) {
          handler = createRuleResolver(current);
          ruleHandlers.set(key, handler);
        }
        const nextToken = handler(token, ctx);

        if (nextToken) {
          rulesCache.set(className, nextToken);
          return nextToken;
        }
      }
      return null;
    },
  };
  return ctx;
}
