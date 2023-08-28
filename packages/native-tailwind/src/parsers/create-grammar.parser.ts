import * as P from '@universal-labs/css/parser';
import { BaseTheme, MaybeColorValue, ThemeConfig } from '../theme.types';
import * as colors from '../theme/colors';
import { baseTailwindTheme } from '../theme/baseTheme';
import {
  createColorParsers,
  flattenColorPalette,
  matchOpacityRule,
} from './rules/color.rules';
import { matchTypographyUtils } from './rules/typography';
import { matchFlexUtils } from './rules/flex';

// const parseColors = P.choice([]);
const parseOthers = P.choice([matchTypographyUtils, matchFlexUtils, matchOpacityRule]);

function resolveTokens<Theme extends BaseTheme = BaseTheme>(
  theme: ThemeConfig<Theme>,
  tokens: string,
) {
  const colorPalette = flattenColorPalette(theme.colors as Record<string, MaybeColorValue>);
  const colorKeys = Object.keys(colorPalette).flatMap((x) => {
    if (typeof colorPalette[x] === 'object') return [];
    return x;
  });
  const colorsParser = createColorParsers(['bg-', 'text-'], colorKeys);

  return P.separatedBy(P.whitespace)(P.choice([colorsParser, parseOthers])).run(tokens);
}

resolveTokens(
  { colors, ...baseTailwindTheme },
  'bg-gray-200 text-blue-200/[0.1] opacity-2 text-lg justify-center',
);
// ?
