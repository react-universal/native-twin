import { choice, literal } from '@universal-labs/css/parser';
import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const alignmentsThemeRules: Rule<BaseTheme>[] = [
  // Floats
  [literal('float-'), 'float', choice([literal('left'), literal('right'), literal('none')])],
  // Clear
  [
    literal('clear-'),
    'clear',
    choice([literal('left'), literal('right'), literal('none'), literal('both')]),
  ],
  // TODO: Overflow
  // [
  //   /^(overflow(?:-[xy])?)-(auto|hidden|clip|visible|scroll)$/,
  //   ({ 1: $1, 2: $2 }) => {
  //     if (!$1 || !$2) return null;
  //     return {
  //       [$1]: $2,
  //     };
  //   },
  // ],
  // Position
  [
    choice([
      literal('static'),
      literal('fixed'),
      literal('absolute'),
      literal('relative'),
      literal('sticky'),
    ]),
    ['position'],
  ],
];
