import {
  toClassName,
  matchCssObject,
  getRuleSelectorGroup,
} from '@universal-labs/native-twin';
import type { Rule } from '@universal-labs/native-twin';
import type { __Theme__ } from '@universal-labs/native-twin';

export const outlineRules: Rule<__Theme__>[] = [
  // matchThemeValue('outline-width-', 'lineWidth', 'outlineWidth'),
  // matchThemeColor('outline-', 'outlineColor'),
  // matchThemeValue('outline-offset-', 'lineWidth', 'outlineOffset'),
  // matchThemeValue('outline-', '', 'outlineStyle', {
  //   customValues: Object.fromEntries(outlineStyles),
  // }),
  matchCssObject('outline-none', (match, ctx, rule) => {
    return {
      className: toClassName(rule),
      declarations: [
        ['outline', '2px solid transparent'],
        ['outlineOffset', '2px'],
      ],
      group: getRuleSelectorGroup(rule),
      rule,
    };
  }),
];

export const appearanceRules: Rule[] = [
  matchCssObject('appearance-none', (match, ctx, rule) => ({
    className: toClassName(rule),
    declarations: [['appearance', 'none']],
    group: getRuleSelectorGroup(rule),
    rule,
  })),
];
