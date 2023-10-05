import { matchCssObject, matchThemeValue } from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import { getRuleSelectorGroup } from '@universal-labs/native-twin';
import { toClassName } from '@universal-labs/native-twin';

export const flexRules: Rule[] = [
  matchCssObject('flex', (match, ctx, rule) => ({
    className: toClassName(rule),
    declarations: [['display', 'flex']],
    group: getRuleSelectorGroup(rule),
    rule,
    mql: [],
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
