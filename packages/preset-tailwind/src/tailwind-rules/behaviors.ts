import { parsedRuleToClassName } from '@universal-labs/css';
import { matchCssObject } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { TailwindPresetTheme } from '../types/theme.types';

export const outlineRules: Rule<TailwindPresetTheme>[] = [
  // matchThemeValue('outline-width-', 'lineWidth', 'outlineWidth'),
  // matchThemeColor('outline-', 'outlineColor'),
  // matchThemeValue('outline-offset-', 'lineWidth', 'outlineOffset'),
  // matchThemeValue('outline-', '', 'outlineStyle', {
  //   customValues: Object.fromEntries(outlineStyles),
  // }),
  matchCssObject('outline-none', (match, ctx, rule) => {
    if (ctx.mode == 'native') {
      return null;
    }
    return {
      className: parsedRuleToClassName(rule),
      declarations: [
        {
          prop: 'outline',
          value: '2px solid transparent',
        },
        {
          prop: 'outlineOffset',
          value: '2px',
        },
      ],
      selectors: [],
      conditions: rule.v,
      important: rule.i,
      precedence: rule.p,
    };
  }),
];

export const appearanceRules: Rule[] = [
  matchCssObject('appearance-none', (match, ctx, rule) => ({
    className: parsedRuleToClassName(rule),
    declarations: [
      {
        prop: 'appearance',
        value: 'none',
      },
    ],
    conditions: rule.v,
    selectors: [],
    important: rule.i,
    precedence: rule.p,
  })),
];
