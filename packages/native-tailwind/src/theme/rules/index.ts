import type { Rule } from '../../types/config.types';
import type { BaseTheme } from '../../types/theme.types';
import { borderThemeValues } from './resolvers/border';
import { colorThemeRules } from './resolvers/color';
import { flexThemeRules } from './resolvers/flex';
import { gapThemeRules } from './resolvers/gap';
import { displayThemeRules } from './resolvers/layout';
import { positionThemeValues } from './resolvers/position';
import { aspectRatioThemeRules } from './resolvers/size';
import { marginThemeRules, paddingThemeRules } from './resolvers/spacing';
import {
  fontSizeThemeRules,
  fontWeightThemeRules,
  lineHeightThemeRules,
  textAlignThemeRules,
} from './resolvers/typography';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  ...colorThemeRules,
  ...flexThemeRules,
  ...paddingThemeRules,
  ...marginThemeRules,
  ...positionThemeValues,
  ...fontWeightThemeRules,
  ...lineHeightThemeRules,
  ...textAlignThemeRules,
  ...fontSizeThemeRules,
  ...displayThemeRules,
  ...borderThemeValues,
  ...gapThemeRules,
  ...aspectRatioThemeRules,
];
