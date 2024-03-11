import { parsedRuleToClassName } from '@universal-labs/css';
import { matchCssObject, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const layoutThemeRules: Rule<TailwindPresetTheme>[] = [
  matchCssObject('hidden', (match, ctx, rule) => ({
    className: parsedRuleToClassName(rule),
    declarations: [
      {
        prop: 'display',
        value: 'none',
      },
    ],
    conditions: rule.v,
    important: rule.i,
    precedence: rule.p,
    selectors: [],
  })),
  matchThemeValue('overflow-', 'overflow', 'overflow'),
  matchThemeValue('object-', 'objectFit', 'objectFit'),
];
