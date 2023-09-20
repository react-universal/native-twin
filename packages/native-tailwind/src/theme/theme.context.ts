import type { PlatformOSType } from 'react-native';
import { type ParsedRule, RuleHandler } from '@universal-labs/css/tailwind';
import type {
  Rule,
  RuleMeta,
  RuleResolver,
  RuleResult,
  TailwindConfig,
  ThemeContext,
} from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenColorPalette } from '../utils/theme-utils';
import { createThemeFunction } from './theme.function';

interface RuleHandlerFn<Theme extends __Theme__ = __Theme__> {
  (token: ParsedRule, ctx: ThemeContext<Theme>): RuleResult;
}

export function createThemeContext<Theme extends __Theme__ = __Theme__>({
  theme: themeConfig,
  rules,
}: TailwindConfig<Theme>): ThemeContext {
  const ruleHandlers = new Map<string, RuleHandlerFn<Theme>>();
  const platform: PlatformOSType = 'native';
  // Platform.OS == 'android' || Platform.OS == 'ios' ? 'native' : 'web';
  const ctx: ThemeContext = {
    get colors() {
      return flattenColorPalette(themeConfig['colors'] ?? {});
    },

    mode: platform,

    theme: createThemeFunction(themeConfig),

    get breakpoints() {
      return Object.keys({ ...themeConfig.screens, ...themeConfig.extend?.screens });
    },

    isSupported(support) {
      return support.includes(platform);
    },

    r(token: ParsedRule) {
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
    if (typeof rule[1] == 'function') {
      return rule[1];
    }
    if (typeof rule[2] == 'function') {
      return rule[2];
    }
    throw new Error('');
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
