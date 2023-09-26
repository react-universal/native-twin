import { type ParsedRule, RuleHandler } from '@universal-labs/css/tailwind';
import type {
  Rule,
  RuleMeta,
  RuleResolver,
  RuleResult,
  TailwindConfig,
  ThemeContext,
} from '../types/config.types';
import type { StyledContext } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenColorPalette, getDefaultStyledContext } from '../utils/theme-utils';
import { createThemeFunction } from './theme.function';

interface RuleHandlerFn<Theme extends __Theme__ = __Theme__> {
  (token: ParsedRule, ctx: ThemeContext<Theme>): RuleResult;
}

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): ThemeContext {
  const ruleHandlers = new Map<string, RuleHandlerFn<Theme>>();
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    theme: createThemeFunction(themeConfig),

    get breakpoints() {
      return Object.assign(themeConfig.screens ?? {}, themeConfig.extend?.screens);
    },

    v(variants, context = getDefaultStyledContext()) {
      if (variants.length == 0) return true;
      for (const v of variants) {
        if (v in this.breakpoints) {
          const width = context.deviceWidth;
          const value = this.breakpoints[v];
          if (typeof value == 'number') {
            return width >= value;
          }
          if (typeof value == 'object') {
            if ('raw' in value) {
              return width >= value.raw;
            }
            if (value.max && value.min) return width <= value.max && width >= value.min;
            if (value.max) return width <= value.max;
            if (value.min) return width >= value.min;
          }
        }
      }
      return true;
    },

    r(token: ParsedRule, styledContext = getDefaultStyledContext()) {
      for (const current of rules) {
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
            styledContext,
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
  styledContext: StyledContext,
): RuleHandlerFn<Theme> {
  return (token: ParsedRule, ctx: ThemeContext<Theme>) => {
    const match = handler.getParser().run(token.n);
    if (match.isError) return null;
    const nextToken = resolver(match.result, ctx, token, styledContext);
    if (!nextToken) return null;
    return nextToken;
  };
}
