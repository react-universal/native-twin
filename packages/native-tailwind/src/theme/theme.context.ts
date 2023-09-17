import type { PlatformOSType } from 'react-native';
import { RuleHandler } from '../parsers/theme.parser';
import type {
  Rule,
  RuleMeta,
  RuleResolver,
  RuleResult,
  TailwindConfig,
  ThemeContext,
} from '../types/config.types';
import type { ParsedRule } from '../types/parser.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenColorPalette } from '../utils/theme-utils';
import { createThemeFunction } from './theme.function';

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): ThemeContext {
  const ruleHandlers = new Map<string, RuleHandler<Theme>>();
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
        const key = JSON.stringify(
          current.filter((x) => typeof x !== 'function' && typeof x !== 'object'),
        );
        let handler = ruleHandlers.get(key);

        if (!handler) {
          let meta: RuleMeta = {};
          if (typeof current[2] == 'object') meta = current[2];
          if (typeof current[3] == 'object' && Object.keys(meta).length == 0)
            meta = current[3];
          handler = new RuleHandler(current[0], getRuleResolver(current), meta);
          ruleHandlers.set(key, handler);
        }
        const nextToken = handler.run(token, ctx);

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
    if (typeof rule[1] == 'function') {
      return rule[1];
    }
    if (typeof rule[2] == 'function') {
      return rule[2];
    }
    throw new Error('');
  }
}
