import { Rule } from '../config.types';
import { BaseTheme } from '../theme.types';

export const tailwindBaseRules: Rule<BaseTheme>[] = [
  // FLEX
  ['flex-', 'flex'],
  ['flex-', 'flexDirection'],
  ['items-', 'alignItems'],
  ['self-', 'alignSelf'],
  ['content-', 'placeContent'],
  ['justify-', 'justifyItems'],
  ['gap-', 'spacing'],
  ['gap-x-', 'spacing'],
  ['gap-y-', 'spacing'],
  // LAYOUT
  ['aspect-', 'aspectRatio'],
  ['', 'display'],
  ['p-', 'spacing'],
  ['px-', 'spacing'],
  ['py-', 'spacing'],
  ['m-', 'spacing'],
  ['mx-', 'spacing'],
  ['my-', 'spacing'],
  // ['leading-', 'lineHeight'],
  // ['bg-', 'colors'],
  // ['font-', 'fontSize'],
  // ['font-', 'fontWeight'],
];
