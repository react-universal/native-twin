import { matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';

const justifyData = {
  start: 'flex-start',
  end: 'flex-end',
  center: 'center',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
  stretch: 'space-stretch',
};
export const flexRules: Rule[] = [
  matchThemeValue('flex', '', 'display', {
    customValues: { '': 'flex' },
  }),
  matchThemeValue('flex-', '', 'flex', {
    customValues: { 1: '1 1 0%', auto: '1 1 auto', initial: '0 1 auto', none: 'none' },
  }),
  matchThemeValue('justify-', '', 'justifyContent', {
    customValues: justifyData,
  }),
];
