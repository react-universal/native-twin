import type { CssValueRawNode } from '../types';
import {
  parseChar,
  parseChoice,
  parseEveryCharUntil,
  parseMany,
  parseSequenceOf,
} from './common';

// font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"

export const parseFontFamily = parseSequenceOf([
  parseEveryCharUntil(parseChoice([parseChar(','), parseChar(';')])).map(
    (x): CssValueRawNode => ({
      type: 'raw',
      value: x,
    }),
  ),
  parseMany(parseChoice([parseChar(',')])),
]);
