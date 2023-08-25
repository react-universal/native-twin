import { toArray, toCondition } from '../common/fn.helpers';
import { CSSObject, CSSProperties } from '../css.types';
import { BaseTheme } from '../theme.types';
import {
  Context,
  MatchConverter,
  MatchResult,
  Rule,
  RuleResolver,
  RuleResult,
  TailwindConfig,
} from '../types';
import { MaybeArray, Falsey } from '../util.types';
import { fromMatch } from './rules';
import { createThemeFunction } from './theme';

type ResolveFunction<Theme extends BaseTheme = BaseTheme> = (
  className: string,
  context: Context<Theme>,
  isDark?: boolean,
  cssProp?: string,
) => RuleResult;

export function createContext<Theme extends BaseTheme = BaseTheme>({
  theme,
  rules,
  ignorelist,
}: TailwindConfig<Theme>): Context<Theme> {
  // Used to cache resolved rule values
  const ruleCache = new Map<string, RuleResult>();

  // lazy created resolve functions
  const ruleResolvers = new Map<Rule<Theme>, ResolveFunction<Theme>>();
  const ignored = createRegExpExecutor(ignorelist, (value, condition) =>
    condition.test(value),
  );

  const ctx = {
    theme: createThemeFunction(theme),

    r(className, isDark) {
      const key = JSON.stringify([className, isDark]);

      if (!ruleCache.has(key)) {
        ruleCache.set(key, !ignored(className, ctx) && resolveRule(className, isDark));
      }
      return ruleCache.get(key);
    },
  } satisfies Context<Theme>;

  return ctx;

  function resolveRule(token: string, isDark?: boolean) {
    for (const item of rules) {
      let resolver = ruleResolvers.get(item);

      if (!resolver) {
        ruleResolvers.set(item, (resolver = getRuleResolver(item)));
      }

      const resolved = resolver(token, ctx, isDark);
      if (resolved) return resolved;
    }
  }
}

function getRuleResolver<Theme extends BaseTheme = BaseTheme>(
  rule: Rule<Theme>,
): ResolveFunction<Theme> {
  if (Array.isArray(rule)) {
    return createResolveFunction(rule[0], rule[1], rule[2]);
  }
  return createResolveFunction(rule);
}

function createResolveFunction<Theme extends BaseTheme = BaseTheme>(
  patterns: MaybeArray<string | RegExp>,
  resolve?: keyof CSSProperties | string | CSSObject | RuleResolver<Theme>,
  convert?: MatchConverter<Theme>,
): ResolveFunction<Theme> {
  return createResolve(patterns, fromMatch(resolve as keyof CSSProperties, convert));
}

function createResolve<Result, Theme extends BaseTheme = BaseTheme>(
  patterns: MaybeArray<string | RegExp>,
  resolve: (match: MatchResult, context: Context<Theme>) => Result,
): (value: string, context: Context<Theme>, isDark?: boolean) => Result | undefined {
  return createRegExpExecutor(patterns, (value, condition, context, isDark?: boolean) => {
    const match = condition.exec(value) as MatchResult | Falsey;

    if (match) {
      match.$$ = value.slice(match[0].length);
      match.dark = isDark;

      return resolve(match, context);
    }
  });
}

function createRegExpExecutor<Result, Theme extends BaseTheme = any>(
  patterns: MaybeArray<string | RegExp>,
  run: (value: string, condition: RegExp, context: Context<Theme>, isDark?: boolean) => Result,
): (value: string, context: Context<Theme>, isDark?: boolean) => Result | undefined {
  const conditions = toArray(patterns).map(toCondition);

  return (value, context, isDark) => {
    for (const condition of conditions) {
      const result = run(value, condition, context, isDark);

      if (result) return result;
    }
  };
}
