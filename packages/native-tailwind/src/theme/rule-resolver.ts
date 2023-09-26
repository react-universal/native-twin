import type { CompleteStyle } from '@universal-labs/css';
import { parseCssValue } from '@universal-labs/css/tailwind';
import type { Rule, RuleMeta, RuleResolver } from '../types/config.types';
import type { __Theme__ } from '../types/theme.types';
import { toColorValue } from '../utils/color-utils';
import { asArray } from '../utils/helpers';

export function matchCssObject(
  pattern: string,
  resolver: RuleResolver<__Theme__>,
  meta: RuleMeta = {},
): Rule<__Theme__> {
  return [pattern, null, resolver, meta];
}

export function matchThemeColor(
  pattern: string,
  property: keyof CompleteStyle,
  meta: RuleMeta = {
    feature: 'default',
    styleProperty: property,
  },
): Rule<__Theme__> {
  return [
    pattern,
    'colors',
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
  themeSection: keyof Theme,
  property: keyof CompleteStyle,
  meta: RuleMeta = {
    canBeNegative: false,
    feature: 'default',
    prefix: '',
    suffix: '',
    styleProperty: property,
  },
): Rule<Theme> {
  return [
    pattern,
    themeSection,
    (match, context, parsedRule, styledContext) => {
      let value: string | null = null;
      let segmentValue = match.segment.value;
      if (parsedRule.m) {
        segmentValue += `/${parsedRule.m.value}`;
      }
      if (match.segment.type == 'arbitrary') {
        value = parseCssValue((themeSection as string) ?? property, segmentValue, {
          deviceHeight: styledContext?.deviceHeight ?? 0,
          deviceWidth: styledContext?.deviceWidth ?? 0,
          rem: styledContext?.units.rem ?? 16,
        }) as string;
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
      if (property == 'transform') {
        return {
          transform: [result],
        } as any;
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

        if (meta.feature == 'transform-2d') {
          return getPropertiesForTransform2d(meta.prefix ?? property, match.suffixes);
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

function getPropertiesForTransform2d(property: string, sides: string[]) {
  if (sides.length == 0) return [`${property}`];
  return sides.map((x) => {
    return `${property}${x}`;
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
      return `-${value}`;
    }
    return (Number(value) * -1) as any;
  }
  return value;
}
