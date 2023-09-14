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
      let color: string | null | undefined;
      if (match.segment.type == 'arbitrary') {
        color = match.segment.value;
      }
      if (!color) {
        color =
          context.colors[match.segment.value] ?? context.theme('colors', match.segment.value);
      }
      if (color) {
        const opacity = context.theme('opacity', rule.m?.value ?? '100');
        color = toColorValue(color!, {
          opacityValue: opacity ?? '1',
        });
        if (meta.feature == 'edges') {
          const result: Record<string, string> = {};
          for (const key of getPropertiesForEdges(
            {
              prefix: meta.prefix ?? property,
              suffix: meta.suffix ?? '',
            },
            match.suffixes,
          )) {
            result[key] = color;
          }
          return result;
        }
        return {
          [property]: color,
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
    prefix: '',
    suffix: '',
    customValues: undefined,
  },
): [string, keyof Theme | (string & {}), RuleResolver<Theme>, RuleMeta] {
  return [
    pattern,
    themeSection == '' && property ? property : themeSection,
    (match, context) => {
      if (meta.customValues) {
        let value =
          match.segment.type == 'arbitrary'
            ? match.segment.value
            : meta.customValues[match.segment.value];
        if (!value) return;
        return {
          [property]: maybeNegative(match.negative, value),
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
          for (const key of getPropertiesForEdges(
            {
              prefix: meta.prefix ?? property,
              suffix: meta.suffix ?? '',
            },
            match.suffixes,
          )) {
            result[key] = maybeNegative(match.negative, value);
          }
          return result;
        }

        if (meta.feature == 'corners') {
          const result: Record<string, string> = {};
          for (const key of getPropertiesForCorners(
            {
              prefix: meta.prefix ?? property,
              suffix: meta.suffix ?? '',
            },
            match.suffixes,
          )) {
            result[key] = maybeNegative(match.negative, value);
          }
          return result;
        }
        return {
          [property]: maybeNegative(match.negative, value),
        };
      }
    },
    meta,
  ];
}

function getPropertiesForEdges(property: { prefix: string; suffix: string }, edges: string[]) {
  if (edges.length == 0) return [`${property.prefix}${property.suffix}`];
  return edges.map((x) => {
    return `${property.prefix}${x}${property.suffix}`;
  });
}

function getPropertiesForCorners(
  property: { prefix: string; suffix: string },
  corners: string[],
) {
  if (corners.length == 0) return [`${property.prefix}${property.suffix}`];
  return corners.map((x) => {
    return `${property.prefix}${x}${property.suffix}`;
  });
}

function maybeNegative(isNegative: boolean, value: string) {
  if (isNegative) {
    return `-${value}`;
  }
  return value;
}
