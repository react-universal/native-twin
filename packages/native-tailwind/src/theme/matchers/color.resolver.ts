import type { Context, ExpArrayMatchResult } from '../../types/config.types';
import type { ParsedRule } from '../../types/parser.types';
import type { BaseTheme } from '../../types/theme.types';
import { toColorValue } from '../theme.utils';

export function colorResolver<Theme extends BaseTheme = BaseTheme>(
  parsedRule: ParsedRule,
  match: ExpArrayMatchResult,
  context: Context<Theme>,
) {
  const themeValue = getColor();
  if (!themeValue) return null;

  if (parsedRule.m) {
    let opacity = parsedRule.m.value;
    if (opacity.startsWith('[') && opacity.endsWith(']')) {
      opacity = opacity.slice(1, -1);
    } else {
      opacity = context.theme('opacity', parsedRule.m.value) ?? '1';
    }
    return toColorValue(themeValue, {
      opacityValue: opacity,
    });
  }
  return toColorValue(themeValue, {
    opacityValue: '1',
  });

  function getColor(): string | null {
    if (match.$$ in context.colors) {
      return context.colors[match.$$] as string;
    }
    if (match[2] && match[2] in context.colors) {
      return context.colors[match[2]] as string;
    }
    return null;
  }
}
