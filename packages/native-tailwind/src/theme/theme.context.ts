import type { PlatformOSType } from 'react-native';
import type {
  ExpArrayMatchResult,
  Rule,
  RuleResolver,
  RuleResult,
  TailwindConfig,
  ThemeContext,
} from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { ParsedRule } from '../types/parser.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenColorPalette } from '../utils/theme-utils';
import { resolveThemeValue } from './rule-resolver';
import { createThemeFunction } from './theme.function';
import { toCondition } from './theme.utils';

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): ThemeContext {
  const ruleHandlers = new Map<string, (parsedRule: ParsedRule) => RuleResult>();
  const cache = new Map<string, RuleResult>();
  const platform: PlatformOSType = 'native';
  // Platform.OS == 'android' || Platform.OS == 'ios' ? 'native' : 'web';
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    mode: platform,

    theme: createThemeFunction(themeConfig),

    isSupported(support) {
      return support.includes(platform);
    },

    r(token: ParsedRule) {
      let cacheKey = token.n;
      if (token.m) {
        cacheKey = cacheKey + `/${token.m.value}`;
      }
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      for (const current of rules) {
        const resolver = getRuleHandler(current);
        const nextToken = resolver(token);

        if (nextToken) {
          cache.set(cacheKey, nextToken);
          return nextToken;
        }
      }
      return null;
    },
  };
  return ctx;

  function getRuleResolver(rule: Rule<Theme>): RuleResolver<Theme> {
    if (typeof rule[1] == 'object') {
      return (_) => {
        return rule[1] as CSSProperties;
      };
    }
    if (typeof rule[2] == 'function') {
      return rule[2];
    }
    return resolveThemeValue(rule[0], rule[1], rule[2], rule[3])[2];
  }
  function getRuleHandler(rule: Rule<Theme>) {
    const key = JSON.stringify([rule[0], rule[1]]);
    if (ruleHandlers.has(key)) {
      return ruleHandlers.get(key)!;
    }
    const resolver = getRuleResolver(rule);
    const condition = toCondition(rule[0]);
    const handler = (parsedRule: ParsedRule) => {
      const match: ExpArrayMatchResult = condition.exec(parsedRule.n) as ExpArrayMatchResult;
      if (!match) return;
      match.$$ = parsedRule.n.slice(match[0].length);
      return resolver(match, ctx, parsedRule);
    };
    ruleHandlers.set(key, handler);
    return handler;
  }
}
