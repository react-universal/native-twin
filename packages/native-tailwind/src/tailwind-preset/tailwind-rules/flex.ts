import { matchCssObject, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';

export const flexRules: Rule[] = [
  matchCssObject('flex', () => ({
    display: 'flex',
  })),
  matchThemeValue('flex-', 'flex', 'flex'),
  matchThemeValue('flex-', 'flexDirection', 'flexDirection'),
  matchThemeValue('flex-', 'flexWrap', 'flexWrap'),
  matchThemeValue('basis-', 'flexBasis', 'flexBasis'),
  matchThemeValue('grow-', 'flexGrow', 'flexGrow'),
  matchThemeValue('justify-', 'justifyContent', 'justifyContent'),
  matchThemeValue('items-', 'alignItems', 'alignItems'),
  matchThemeValue('self-', 'alignItems', 'alignSelf'),
];
