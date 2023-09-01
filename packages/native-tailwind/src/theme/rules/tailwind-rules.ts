import type { Rule } from '../../types/config.types';
import type { BaseTheme } from '../../types/theme.types';
import { colorThemeRules } from './resolvers/color';
import { flexThemeRules } from './resolvers/flex';
import { gapThemeRules } from './resolvers/gap';
import { displayThemeRules } from './resolvers/layout';
import { aspectRatioThemeRules } from './resolvers/size';
import { marginThemeRules, paddingThemeRules } from './resolvers/spacing';
import {
  fontSizeThemeRules,
  fontWeightThemeRules,
  lineHeightThemeRules,
  textAlignThemeRules,
} from './resolvers/typography';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // COLOR UTILS
  ...colorThemeRules,
  // FLEX
  ...flexThemeRules,
  // GAP
  ...gapThemeRules,
  // LAYOUT
  ...aspectRatioThemeRules,
  ...displayThemeRules,

  // SPACING
  ...paddingThemeRules,
  ...marginThemeRules,

  // FONT
  ...fontWeightThemeRules,
  ...lineHeightThemeRules,
  // TEXT
  ...textAlignThemeRules,
  ...fontSizeThemeRules,
];
