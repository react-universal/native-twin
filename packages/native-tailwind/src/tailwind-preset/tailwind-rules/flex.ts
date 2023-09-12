import { resolveThemeValue } from '../../theme/rule-resolver';
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
  ['flex', { display: 'flex' }],
  resolveThemeValue('justify-', '', 'justifyContent', {
    canBeNegative: false,
    feature: 'default',
    customValues: justifyData,
  }),
];
