import { createRuleResolver } from '../parsers/rule-handler';
import { createVariantResolver } from '../parsers/variant-handler';
import type {
  RuleResult,
  TailwindConfig,
  ThemeContext,
  Variant,
  VariantResult,
} from '../types/config.types';
import type { ParsedRule } from '../types/tailwind.types';
import type { __Theme__ } from '../types/theme.types';
import type { MaybeArray } from '../types/util.types';
import { toClassName } from '../utils/string-utils';
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
  variants = [],
}: TailwindConfig<Theme>): ThemeContext {
  const variantCache = new Map<string, MaybeArray<string>>();
  const ruleHandlers = new Map<string, RuleHandlerFn<Theme>>();
  const cache = new Map<string, RuleResult>();
  const variantsHandlers = new Map<Variant<Theme>, VariantHandlerFn<Theme>>();
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    theme: createThemeFunction(themeConfig),

    get breakpoints() {
      return Object.assign(themeConfig.screens ?? {}, themeConfig.extend?.screens);
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
        const className = toClassName(token);
        if (cache.has(className)) {
          return cache.get(className);
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
          cache.set(className, nextToken);
          return nextToken;
        }
      }
      return null;
    },
  };
  return ctx;
}

// function createRuleHandler<Theme extends __Theme__ = __Theme__>(
//   handler: RuleHandler,
//   resolver: RuleResolver,
// ): RuleHandlerFn<Theme> {
//   return (token: ParsedRule, ctx: ThemeContext<Theme>) => {
//     const match = handler.getParser().run(token.n);
//     if (match.isError) return null;
//     const nextToken = resolver(match.result, ctx, token);
//     if (!nextToken) return null;
//     return nextToken;
//   };
// }
