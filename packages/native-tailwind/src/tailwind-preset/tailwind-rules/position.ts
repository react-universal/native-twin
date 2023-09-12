import { matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';

export const positionRules: Rule[] = [
  matchThemeValue('-?top-', 'spacing', 'top', {
    canBeNegative: true,
  }),
  matchThemeValue('-?left-', 'spacing', 'left', {
    canBeNegative: true,
  }),
  matchThemeValue('-?bottom-', 'spacing', 'bottom', {
    canBeNegative: true,
  }),
  matchThemeValue('-?right-', 'spacing', 'right', {
    canBeNegative: true,
  }),
];
