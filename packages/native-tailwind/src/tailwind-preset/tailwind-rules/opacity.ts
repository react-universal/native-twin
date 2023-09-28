import { matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

export const opacityRules: Rule<__Theme__>[] = [
  matchThemeValue('opacity-', 'opacity', 'opacity'),
];
