import type { Rule } from '../../../types/config.types';
import type { BaseTheme } from '../../../types/theme.types';

export const flexThemeRules: Rule<BaseTheme>[] = [
  [/flex-(.+)$/, { themeAlias: 'flex' }],
  [/flex-(.*)$/, { themeAlias: 'flexDirection' }],
  ['items-', { themeAlias: 'alignItems' }],
  ['self-', { themeAlias: 'alignSelf' }],
  ['content-', { themeAlias: 'placeContent' }],
  ['justify-items-', { themeAlias: 'justifyItems', support: ['web'] }],
  ['justify-', { themeAlias: 'justifyContent' }],
];
