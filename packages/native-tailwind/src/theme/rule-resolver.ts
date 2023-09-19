import type { RuleMeta, RuleResolver } from '../types/config.types';
import type { CompleteStyle } from '../types/rn.types';
import type { __Theme__ } from '../types/theme.types';
import { toColorValue } from '../utils/color-utils';
import { asArray } from '../utils/helpers';

export function matchCssObject(
  pattern: string,
  resolver: RuleResolver<__Theme__>,
  meta: RuleMeta = {},
): [string, RuleResolver<__Theme__>, RuleMeta] {
  return [pattern, resolver, meta];
}

export function matchThemeColor(
  pattern: string,
  property: keyof CompleteStyle,
  meta: RuleMeta = {},
): [string, keyof CompleteStyle, RuleResolver<__Theme__>, RuleMeta] {
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
  property: keyof CompleteStyle,
  meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    prefix: '',
    suffix: '',
  },
): [string, keyof Theme | (string & {}), RuleResolver<Theme>, RuleMeta] {
  return [
    pattern,
    themeSection == '' && property ? property : themeSection,
    (match, context, parsedRule) => {
      let value: string | null = null;
      let segmentValue = match.segment.value;

      if (parsedRule.m) {
        segmentValue += `/${parsedRule.m.value}`;
      }
      if (match.segment.type == 'arbitrary') {
        value = segmentValue;
      } else {
        value = context.theme(themeSection, segmentValue) ?? null;
      }

      if (!value) return;
      let result: Record<string, string> = {};
      let properties = getProperties();
      value = maybeNegative(match.negative, value);

      if (typeof value == 'object' && !Array.isArray(value)) {
        return value;
      }
      for (const current of properties) {
        result[current] = value;
      }
      return result;

      function getProperties() {
        if (meta.feature == 'edges') {
          return getPropertiesForEdges(
            {
              prefix: meta.prefix ?? property,
              suffix: meta.suffix ?? '',
            },
            match.suffixes,
          );
        }

        if (meta.feature == 'corners') {
          return getPropertiesForCorners(
            {
              prefix: meta.prefix ?? property,
              suffix: meta.suffix ?? '',
            },
            match.suffixes,
          );
        }

        if (meta.feature == 'gap') {
          return getPropertiesForGap(
            {
              prefix: meta.suffix ?? '',
              suffix: property ?? '',
            },
            match.suffixes,
          );
        }
        return asArray(property);
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

function getPropertiesForGap(property: { prefix: string; suffix: string }, edges: string[]) {
  if (edges.length == 0) return [`${property.prefix}${property.suffix}`];
  return edges.map((x) => {
    return `${property.prefix}${x}${property.suffix.replace(
      /^[a-z]/,
      (k) => k[0]?.toUpperCase()! ?? '',
    )}`;
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

function maybeNegative(isNegative: boolean, value: string): string {
  if (isNegative && (!`${value}`.startsWith('0') || `${value}`.startsWith('0.'))) {
    if (isNaN(Number(value))) {
      return `-${value}${value.endsWith('px') ? '' : ''}`;
    }
    return (Number(value) * -1) as any;
  }
  return value;
}