import * as P from '@universal-labs/css/parser';
import type { Rule, RuleMeta } from '../types/config.types';
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

export function createRuleParser(pattern: string, meta = defaultRuleMeta) {
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
): Rule<__Theme__> {
  return [
    pattern,
    (token, theme, rule) => {
      const parser = createRuleParser(pattern);
      if (parser.run(token).isError) return undefined;

      const following = token.slice(pattern.length);
      if (resolvedColors.size == 0) {
        const colors = flattenColorPalette(theme.colors ?? {});
        resolvedColors = new Map(Object.entries(colors));
      }
      if (resolvedColors.has(following)) {
        return {
          [property]: toColorValue(resolvedColors.get(following)!, {
            opacityValue: rule.m?.value ?? '1',
          }),
        };
      }
    },
  ];
}

export function resolveThemeValue<Theme extends __Theme__ = __Theme__>(
  pattern: string,
  themeSection: keyof Theme,
  property: keyof CSSProperties,
  _meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
  },
): Rule<Theme> {
  return [
    pattern,
    (token, theme) => {
      const parser = createRuleParser(pattern);
      if (parser.run(token).isError) return undefined;
      const following = token.slice(pattern.length);
      const themeSectionValues = flattenThemeSection(theme[themeSection] ?? {});
      if (following in themeSectionValues) {
        return {
          [property]: themeSectionValues[following],
        };
      }
    },
  ];
}
