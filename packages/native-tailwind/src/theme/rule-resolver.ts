import * as P from '@universal-labs/css/parser';
import type { RuleMeta, RuleResolver, TailwindRuleResolver } from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenColorPalette } from '../utils/theme-utils';
import { flattenThemeSection, toColorValue } from './theme.utils';

const defaultRuleMeta: RuleMeta = {
  canBeNegative: false,
  feature: 'default',
  baseProperty: undefined,
};

const maybeNegative = P.maybe(P.char('-'));

function createRuleParser(pattern: string, meta = defaultRuleMeta) {
  const baseParser = P.literal(pattern);
  if (meta.canBeNegative) {
    return P.sequenceOf([maybeNegative, baseParser]).map((x) => x[1]);
  }
  return baseParser;
}

let resolvedColors = new Map<string, string>();
export function resolveColorValue(
  pattern: string,
  property: keyof CSSProperties,
): TailwindRuleResolver<__Theme__> {
  const parser = createRuleParser(pattern);
  return Object.defineProperties(
    function resolver(following, theme, parsedRule) {
      if (resolvedColors.size == 0) {
        const colors = flattenColorPalette(theme.colors ?? {});
        resolvedColors = new Map(Object.entries(colors));
      }
      if (resolvedColors.has(following)) {
        return {
          [property]: toColorValue(resolvedColors.get(following)!, {
            opacityValue: parsedRule.m?.value ?? '1',
          }),
        };
      }
    } as RuleResolver<__Theme__>,
    Object.getOwnPropertyDescriptors({
      test(token: string) {
        return parser.run(token).isError;
      },
      get pattern() {
        return pattern;
      },
    }),
  ) as TailwindRuleResolver<__Theme__>;
}

export function resolveThemeValue<Theme extends __Theme__ = __Theme__>(
  pattern: string,
  themeSection: keyof Theme,
  property: keyof CSSProperties,
  _meta = defaultRuleMeta,
): TailwindRuleResolver<__Theme__> {
  const parser = createRuleParser(pattern);
  return Object.defineProperties(
    function resolver(following, theme) {
      const themeSectionValues = flattenThemeSection(theme[themeSection] ?? {});
      if (following in themeSectionValues) {
        return {
          [property]: themeSectionValues[following],
        };
      }
    } as RuleResolver<Theme>,
    Object.getOwnPropertyDescriptors({
      test(token: string) {
        return parser.run(token).isError;
      },
      get pattern() {
        return pattern;
      },
    }),
  ) as TailwindRuleResolver<Theme>;
}
