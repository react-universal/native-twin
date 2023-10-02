import { matchCssObject, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { getRuleSelectorGroup, toClassName } from '@universal-labs/native-twin';

export const layoutThemeRules: Rule[] = [
  matchCssObject('hidden', (match, ctx, rule) => ({
    className: toClassName(rule),
    declarations: [['display', 'none']],
    group: getRuleSelectorGroup(rule),
    rule,
  })),
  matchThemeValue('overflow-', 'overflow', 'overflow'),
  matchThemeValue('object-', 'objectFit', 'objectFit'),
];
