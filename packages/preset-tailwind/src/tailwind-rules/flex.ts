import { parsedRuleToClassName } from '@universal-labs/css';
import { matchCssObject, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
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
