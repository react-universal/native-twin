import { matchCssObject, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';

export const layoutThemeRules: Rule[] = [
  matchCssObject('hidden', () => ({
    display: 'none',
  })),
  matchThemeValue('overflow-', 'overflow', 'overflow'),
];
