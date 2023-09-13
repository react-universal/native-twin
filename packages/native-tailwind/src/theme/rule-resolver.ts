import type { RuleMeta, RuleResolver } from '../types/config.types';
import type { CSSProperties } from '../types/css.types';
import type { __Theme__ } from '../types/theme.types';
import { toColorValue } from '../utils/color-utils';

export function matchCssObject(
  pattern: string,
  resolver: RuleResolver<__Theme__>,
  meta: RuleMeta = {},
): [string, RuleResolver<__Theme__>, RuleMeta] {
  return [pattern, resolver, meta];
}

export function matchThemeColor(
  pattern: string,
  property: keyof CSSProperties,
  meta: RuleMeta = {},
): [string, keyof CSSProperties, RuleResolver<__Theme__>, RuleMeta] {
  return [
    pattern,
    property,
    (match, context, rule) => {
      const color = context.colors[match.segment.value];
      if (color) {
        const opacity = context.theme('opacity', rule.m?.value ?? '100');
        return {
          [property]: toColorValue(color!, {
            opacityValue: opacity ?? '1',
          }),
        };
      }
    },
    meta,
  ];
}

export function matchThemeValue<Theme extends __Theme__ = __Theme__>(
  pattern: string,
  themeSection: keyof Theme | (string & {}),
  property: keyof CSSProperties,
  meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    baseProperty: undefined,
    customValues: undefined,
  },
): [string, keyof Theme | (string & {}), RuleResolver<Theme>, RuleMeta] {
  return [
    pattern,
    themeSection,
    (match, context) => {
      if (meta.customValues) {
        let value =
          match.segment.type == 'arbitrary'
            ? match.segment.value
            : meta.customValues[match.segment.value];
        if (!value) return;
        return {
          [property]: value,
        };
      }
      let value: string | null = null;
      if (match.segment.type == 'arbitrary') {
        value = match.segment.value;
      } else {
        value = context.theme(themeSection, match.segment.value) ?? null;
      }
      if (value) {
        if (meta.feature == 'edges') {
          const result: Record<string, string> = {};
          for (const key of getPropertiesForEdges(property, match.suffixes)) {
            result[key] = value;
          }
          return result;
        }
        return {
          [property]: value,
        };
      }
    },
    meta,
  ];
}

function getPropertiesForEdges(property: string, data: string[]) {
  if (data.length == 0) return [property];
  return data.map((x) => {
    return `${property}${x}`;
  });
}
