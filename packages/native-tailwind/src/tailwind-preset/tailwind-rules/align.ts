import { resolveThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import { globalKeywords } from '../../utils/mappings';

const verticalAlignAlias: Record<string, string> = {
  mid: 'middle',
  base: 'baseline',
  btm: 'bottom',
  baseline: 'baseline',
  top: 'top',
  start: 'top',
  middle: 'middle',
  bottom: 'bottom',
  end: 'bottom',
  'text-top': 'text-top',
  'text-bottom': 'text-bottom',
  sub: 'sub',
  super: 'super',
  ...Object.fromEntries(globalKeywords.map((x) => [x, x])),
};

export const verticalAlignsRules: Rule[] = [
  resolveThemeValue('align-', '', 'verticalAlign', {
    canBeNegative: false,
    feature: 'default',
    customValues: verticalAlignAlias,
  }),
];

const textAligns = {
  center: 'center',
  left: 'left',
  right: 'right',
  justify: 'justify',
  start: 'start',
  end: 'end',
};
export const textAlignsRules: Rule[] = [
  resolveThemeValue('text-', '', 'textAlign', {
    canBeNegative: false,
    feature: 'default',
    customValues: textAligns,
  }),
];
