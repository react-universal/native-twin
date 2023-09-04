import type { Rule } from '../../types/config.types';
import type { BaseTheme } from '../../types/theme.types';
import { borderThemeRules } from './resolvers/border';
import { boxThemeRules } from './resolvers/box';
import { colorThemeRules } from './resolvers/color';
import { flexThemeRules } from './resolvers/flex';
import { gapThemeRules } from './resolvers/gap';
import { displayThemeRules } from './resolvers/layout';
import { positionThemeRules } from './resolvers/position';
import { aspectRatioThemeRules } from './resolvers/size';
import { marginThemeRules, paddingThemeRules } from './resolvers/spacing';
import { tableThemeRules } from './resolvers/table';
import { typographyThemeRules } from './resolvers/typography';

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
];
