import { matchCssObject, matchThemeValue } from '@native-twin/core';
import type { Rule } from '@native-twin/core';
import { parsedRuleToClassName } from '@native-twin/css';
import { TailwindPresetTheme } from '../types/theme.types';

export const flexRules: Rule<TailwindPresetTheme>[] = [
  matchCssObject('flex', (match, ctx, rule) => ({
    className: parsedRuleToClassName(rule),
    declarations: [
      {
        prop: 'display',
        value: 'flex',
      },
    ],
    conditions: rule.v,
    important: rule.i,
    precedence: rule.p,
    selectors: [],
    animations: [],
  })),
  matchThemeValue('flex-', 'flex', 'flex'),
  matchThemeValue('flex-', 'flexDirection', 'flexDirection'),
  matchThemeValue('flex-', 'flexWrap', 'flexWrap'),
  matchThemeValue('basis-', 'flexBasis', 'flexBasis'),
  matchThemeValue('grow-', 'flexGrow', 'flexGrow'),
  matchThemeValue('justify-', 'justifyContent', 'justifyContent'),
  matchThemeValue('items-', 'alignItems', 'alignItems'),
  matchThemeValue('self-', 'alignItems', 'alignSelf'),
  matchThemeValue('content-', 'alignContent', 'alignContent'),
];
