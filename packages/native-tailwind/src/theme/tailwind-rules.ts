import { Rule } from '../config.types';
import { BaseTheme } from '../theme.types';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // FLEX
  ['flex-', { propertyAlias: ['flex', 'flexDirection'] }],
  ['items-', { propertyAlias: 'alignItems' }],
  ['self-', { propertyAlias: 'alignSelf' }],
  ['content-', { propertyAlias: 'placeContent' }],
  ['justify-', { propertyAlias: 'justifyItems' }],
  ['gap-', { propertyAlias: 'gap' }],
  ['gap-x-', { propertyAlias: 'gap' }],
  ['gap-y-', { propertyAlias: 'gap' }],
  // // LAYOUT
  ['aspect-', { propertyAlias: 'aspectRatio' }],
  [['hidden', 'flex'], { propertyAlias: 'display' }],
  ['p-', { propertyAlias: 'padding', canBeNegative: true }],
  ['px-', { propertyAlias: 'padding', canBeNegative: true }],
  ['py-', { propertyAlias: 'padding', canBeNegative: true }],
  ['m-', { propertyAlias: 'margin', canBeNegative: true }],
  ['mx-', { propertyAlias: 'margin', canBeNegative: true }],
  ['my-', { propertyAlias: 'margin', canBeNegative: true }],
  ['leading-', { propertyAlias: 'lineHeight' }],
  ['bg-', { propertyAlias: 'backgroundColor' }],
  ['font-', { propertyAlias: 'fontSize' }],
  ['font-', { propertyAlias: 'fontWeight' }],
];
