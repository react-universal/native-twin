import type { Rule } from '../../types/config.types';
import type { BaseTheme } from '../../types/theme.types';
import { alignmentsThemeRules } from './patterns/alignments';
import { borderThemeRules } from './patterns/border';
import { boxThemeRules } from './patterns/box';
import { colorThemeRules } from './patterns/color';
import { flexThemeRules } from './patterns/flex';
import { gapThemeRules } from './patterns/gap';
import { displayThemeRules } from './patterns/layout';
import { positionThemeRules } from './patterns/position';
import { aspectRatioThemeRules } from './patterns/size';
import { marginThemeRules, paddingThemeRules } from './patterns/spacing';
import { tableThemeRules } from './patterns/table';
import { typographyThemeRules } from './patterns/typography';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  ...colorThemeRules,
  ...flexThemeRules,
  ...paddingThemeRules,
  ...marginThemeRules,
  ...positionThemeRules,
  ...typographyThemeRules,
  ...displayThemeRules,
  ...borderThemeRules,
  ...gapThemeRules,
  ...aspectRatioThemeRules,
  ...boxThemeRules,
  ...tableThemeRules,
  ...alignmentsThemeRules,
];
