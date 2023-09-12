import type { RuleMeta, RuleResolver } from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
import { flattenThemeSection, toColorValue } from './theme.utils';

export function resolveColorValue(
  pattern: string,
  property: keyof CSSProperties,
  _meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
  },
): [string, keyof CSSProperties, RuleResolver<__Theme__>] {
  return [
    pattern,
    property,
    (context, rule) => {
      const following = rule.n.slice(pattern.length);
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

const flattenSections = new Map<any, Record<string, string>>();
export function resolveThemeValue<Theme extends __Theme__ = __Theme__>(
  pattern: string,
  themeSection: keyof Theme | (string & {}),
  property: keyof CSSProperties | undefined,
  _meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
  },
): [string, keyof Theme | (string & {}), RuleResolver<Theme>] {
  return [
    pattern,
    themeSection,
    (context, rule) => {
      if (!flattenSections.has(themeSection)) {
        flattenSections.set(
          themeSection,
          flattenThemeSection(context.theme(themeSection, rule)),
        );
      }
      const themeSectionValue = flattenSections.get(themeSection);
      const following = rule.n.slice(pattern.length);
      if (themeSectionValue && following in themeSectionValue) {
        return {
          [property ?? themeSection]: themeSectionValue[following],
        };
      }
    },
  ];
}
