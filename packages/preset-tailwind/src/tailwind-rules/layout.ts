import { matchCssObject, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { parsedRuleToClassName } from '@universal-labs/native-twin';

export const layoutThemeRules: Rule[] = [
  matchCssObject('hidden', (match, ctx, rule) => ({
    className: parsedRuleToClassName(rule),
    declarations: [['display', 'none']],
    conditions: rule.v,
    important: rule.i,
    precedence: rule.p,
    selectors: [],
  })),
  matchThemeValue('overflow-', 'overflow', 'overflow'),
  matchThemeValue('object-', 'objectFit', 'objectFit'),
];
