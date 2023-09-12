import { resolveThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';

export const positionRules: Rule[] = [
  resolveThemeValue('-?top-', 'spacing', 'top', {
    canBeNegative: true,
    feature: 'default',
  }),
  resolveThemeValue('-?left-', 'spacing', 'left', {
    canBeNegative: true,
    feature: 'default',
  }),
  resolveThemeValue('-?bottom-', 'spacing', 'bottom', {
    canBeNegative: true,
    feature: 'default',
  }),
  resolveThemeValue('-?right-', 'spacing', 'right', {
    canBeNegative: true,
    feature: 'default',
  }),
];
