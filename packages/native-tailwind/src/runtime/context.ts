import { escape } from '../common/escape';
import {
  identity,
  noop,
  toArray,
  hash as defaultHash,
  toCondition,
} from '../common/fn.helpers';
import type {
  BaseTheme,
  Context,
  MaybeArray,
  Rule,
  RuleResult,
  RuntimeConfig,
  Variant,
  VariantResult,
} from '../types';

type ResolveFunction<Theme extends BaseTheme = BaseTheme> = (
  className: string,
  context: Context<Theme>,
  isDark?: boolean,
) => RuleResult;

type VariantFunction<Theme extends BaseTheme = BaseTheme> = (
  variant: string,
  context: Context<Theme>,
) => VariantResult;

export function createContext<Theme extends BaseTheme = BaseTheme>({
  theme,
  darkMode,
  darkColor = noop,
  variants,
  rules,
  hash,
  ignorelist,
  finalize,
}: RuntimeConfig<Theme>): Context<Theme> {
  // Used to cache resolved rule values
  const variantCache = new Map<string, MaybeArray<string>>();

  // lazy created resolve functions
  const variantResolvers = new Map<Variant<Theme>, VariantFunction<Theme>>();

  // Used to cache resolved rule values
  const ruleCache = new Map<string, RuleResult>();

  // lazy created resolve functions
  const ruleResolvers = new Map<Rule<Theme>, ResolveFunction<Theme>>();

  const ignored = createRegExpExecutor(ignorelist, (value, condition) =>
    condition.test(value),
  );

  const reportedUnknownClasses = /* #__PURE__ */ new Set<string>();

  // add dark as last variant to allow user to override it
  // we can modify variants as it has been passed through defineConfig which already made a copy
  variants.push([
    'dark',
    Array.isArray(darkMode) || darkMode == 'class'
      ? `${toArray(darkMode)[1] || '.dark'} &`
      : typeof darkMode == 'string' && darkMode != 'media'
      ? darkMode // a custom selector
      : '@media (prefers-color-scheme:dark)',
  ]);

  const h =
    typeof hash == 'function'
      ? (value: string) => hash(value, defaultHash)
      : hash
      ? defaultHash
      : identity;

  if (h !== identity) {
    finalize.push((rule) => ({
      ...rule,
      n: rule.n && h(rule.n),
      d: rule.d?.replace(
        /--(tw(?:-[\w-]+)?)\b/g,
        (_: string, property: string) => '--' + h(property).replace('#', ''),
      ),
    }));
  }

  const ctx: Context<Theme> = {
    theme: makeThemeFunction(theme),

    e: escape,

    h,

    s(property, value) {
      return stringify(property, value, ctx);
    },

    d(section, key, color) {
      return darkColor(section, key, ctx, color);
    },

    v(value) {
      if (!variantCache.has(value)) {
        variantCache.set(
          value,
          find(value, variants, variantResolvers, getVariantResolver, ctx) || '&:' + value,
        );
      }

      return variantCache.get(value) as string;
    },

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

    f(rule) {
      return finalize.reduce((rule, p) => p(rule, ctx), rule);
    },
  };

  return ctx;
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
