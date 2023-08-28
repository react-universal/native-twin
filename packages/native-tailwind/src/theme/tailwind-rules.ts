import { Rule } from '../config.types';
import { BaseTheme } from '../theme.types';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // FLEX
  ['flex-', { propertyAlias: ['flex', 'flexDirection'] }],
  ['items-', { propertyAlias: 'alignItems' }],
  ['self-', { propertyAlias: 'alignSelf' }],
  ['content-', { propertyAlias: 'placeContent' }],
  ['justify-', { propertyAlias: 'justifyItems' }],
  [['gap-', 'gap-x', 'gap-y'], { propertyAlias: 'gap' }],
  // // LAYOUT
  ['aspect-', { propertyAlias: 'aspectRatio' }],
  [['hidden', 'flex'], { propertyAlias: 'display' }],
  [['p-', 'px-', 'py-'], { propertyAlias: 'padding', canBeNegative: true }],
  [['m-', 'mx-', 'my-'], { propertyAlias: 'margin', canBeNegative: true }],
  ['leading-', { propertyAlias: 'lineHeight' }],
  ['bg-', { propertyAlias: 'backgroundColor' }],
  ['font-', { propertyAlias: ['fontSize', 'fontWeight'] }],
];
