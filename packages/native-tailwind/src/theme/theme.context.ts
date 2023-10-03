import { RuleHandler } from '../parsers/tailwind-theme.parser';
import type {
  Rule,
  RuleMeta,
  RuleResolver,
  RuleResult,
  TailwindConfig,
  ThemeContext,
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

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): ThemeContext {
  const variantCache = new Map<string, MaybeArray<string>>();
  const ruleHandlers = new Map<string, RuleHandlerFn<Theme>>();
  const cache = new Map<string, RuleResult>();
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    theme: createThemeFunction(themeConfig),

    get breakpoints() {
      return Object.assign(themeConfig.screens ?? {}, themeConfig.extend?.screens);
    },

    v(value) {
      // if (!variantCache.has(value)) {
      //   variantCache.set(
      //     value,
      //     find(value, variants, variantResolvers, getVariantResolver, ctx) || '&:' + value,
      //   );
      // }

      return variantCache.get(value) as string;
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
          let meta: RuleMeta = {};
          if (typeof current[2] == 'object') meta = current[2];
          if (typeof current[3] == 'object') meta = current[3];
          const resolver = getRuleResolver(current);
          handler = createRuleHandler(
            new RuleHandler(current[0], meta.feature ?? 'default'),
            resolver,
          );
          ruleHandlers.set(key, handler);
        }
        const nextToken = handler(token, ctx);

        if (nextToken) {
          return nextToken;
        }
      }
      return null;
    },
  };
  return ctx;

  function getRuleResolver(rule: Rule<Theme>): RuleResolver<Theme> {
    return rule[2];
  }
}

function createRuleHandler<Theme extends __Theme__ = __Theme__>(
  handler: RuleHandler,
  resolver: RuleResolver,
): RuleHandlerFn<Theme> {
  return (token: ParsedRule, ctx: ThemeContext<Theme>) => {
    const match = handler.getParser().run(token.n);
    if (match.isError) return null;
    const nextToken = resolver(match.result, ctx, token);
    if (!nextToken) return null;
    return nextToken;
  };
}
