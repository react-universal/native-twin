import * as P from '@universal-labs/css/parser';
import type { RuleMeta, RuleResolver } from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
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

export function resolveColorValue(
  pattern: string,
  property: keyof CSSProperties,
  _meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
  },
): [string, RuleResolver<__Theme__>] {
  return [
    pattern,
    (token, context, rule) => {
      const parser = createRuleParser(pattern);
      if (parser.run(token).isError) return undefined;

      const following = token.slice(pattern.length);
      if (following in context.colors) {
        return {
          [property]: toColorValue(context.colors[following]!, {
            opacityValue: rule.m?.value ?? '1',
          }),
        };
      }
    },
  ];
}

export function resolveThemeValue<Theme extends __Theme__ = __Theme__>(
  pattern: string,
  themeSection: keyof Theme | (string & {}),
  property: keyof CSSProperties | undefined,
  _meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
  },
): [string, RuleResolver<Theme>] {
  return [
    pattern,
    (token, context, rule) => {
      const parser = createRuleParser(pattern);
      if (parser.run(token).isError) return undefined;
      const following = token.slice(pattern.length);
      const themeSectionValues = flattenThemeSection(context.theme(themeSection, rule));
      if (following in themeSectionValues) {
        return {
          [themeSection ?? property]: themeSectionValues[following],
        };
      }
    },
  ];
}
