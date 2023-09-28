import { matchCssObject, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import { getRuleSelectorGroup } from '../../utils/css-utils';
import { toClassName } from '../../utils/string-utils';

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
