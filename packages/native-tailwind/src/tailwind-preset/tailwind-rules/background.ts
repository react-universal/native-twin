import { resolveColorValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import type { __Theme__ } from '../../types/theme.types';

export const backgroundRules: Rule<__Theme__>[] = [
  resolveColorValue('bg-', 'backgroundColor'),
];
