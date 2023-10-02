import { matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';

export const positionRules: Rule[] = [
  matchThemeValue('top-', 'spacing', 'top', {
    canBeNegative: true,
  }),
  matchThemeValue('left-', 'spacing', 'left', {
    canBeNegative: true,
  }),
  matchThemeValue('bottom-', 'spacing', 'bottom', {
    canBeNegative: true,
  }),
  matchThemeValue('right-', 'spacing', 'right', {
    canBeNegative: true,
  }),
  matchThemeValue('absolute|relative', 'position', 'position'),
  matchThemeValue('z-', 'zIndex', 'zIndex', {
    canBeNegative: true,
  }),
];
