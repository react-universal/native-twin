import { matchCssObject, matchThemeValue } from '../../theme/rule-resolver';
import type { Rule } from '../../types/config.types';
import { getRuleSelectorGroup } from '../../utils/css-utils';
import { toClassName } from '../../utils/string-utils';

export const flexRules: Rule[] = [
  matchCssObject('flex', (match, ctx, rule) => ({
    className: toClassName(rule),
    declarations: [['display', 'flex']],
    group: getRuleSelectorGroup(rule),
    rule,
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
