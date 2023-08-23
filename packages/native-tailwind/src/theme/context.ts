import { toArray, toCondition } from '../common/fn.helpers';
import {
  BaseTheme,
  CSSObject,
  CSSProperties,
  Context,
  Falsey,
  MatchConverter,
  MatchResult,
  MaybeArray,
  Rule,
  RuleResolver,
  RuleResult,
  TailwindConfig,
} from '../types';
import { match } from './rules';
import { createThemeFunction } from './theme';

type ResolveFunction<Theme extends BaseTheme = BaseTheme> = (
  className: string,
  context: Context<Theme>,
  isDark?: boolean,
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

  const ctx: Context<Theme> = {
    theme: createThemeFunction(theme),

    r(className, isDark) {
      const key = JSON.stringify([className, isDark]);

      if (!ruleCache.has(key)) {
        ruleCache.set(
          key,
          !ignored(className, ctx) &&
            find(className, rules, ruleResolvers, getRuleResolver, ctx, isDark),
        );
      }
      return ruleCache.get(key);
    },
  };

  return ctx;
}

function find<Value, Config, Result, Theme extends BaseTheme = BaseTheme>(
  value: Value,
  list: Config[],
  cache: Map<Config, (value: Value, context: Context<Theme>, isDark?: boolean) => Result>,
  getResolver: (
    item: Config,
  ) => (value: Value, context: Context<Theme>, isDark?: boolean) => Result,
  context: Context<Theme>,
  isDark?: boolean,
) {
  for (const item of list) {
    let resolver = cache.get(item);

    if (!resolver) {
      cache.set(item, (resolver = getResolver(item)));
    }

    const resolved = resolver(value, context, isDark);
    if (resolved) return resolved;
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
  return createResolve(patterns, match(patterns, resolve as keyof CSSProperties, convert)[1]);
}

function createResolve<Result, Theme extends BaseTheme = BaseTheme>(
  patterns: MaybeArray<string | RegExp>,
  resolve: (match: MatchResult, context: Context<Theme>) => Result,
): (value: string, context: Context<Theme>, isDark?: boolean) => Result | undefined {
  return createRegExpExecutor(patterns, (value, condition, context, isDark?: boolean) => {
    const match = condition.exec(value) as MatchResult | Falsey;

    if (match) {
      // MATCH.$_ = value
      // this will create the following match string eg: bg-gray-200 will became gray-200
      match.$$ = value.slice(match[0].length);
      match.dark = isDark;
      // console.log('EXEC: ', match);

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
