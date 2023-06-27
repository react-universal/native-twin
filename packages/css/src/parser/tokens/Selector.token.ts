import * as P from '../Parser';

export const SelectorValidChars = P.everyCharUntil('{');

export const SelectorToken = SelectorValidChars;
