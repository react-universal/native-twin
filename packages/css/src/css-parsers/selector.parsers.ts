import { string } from '../lib';

export const SelectorValidChars = string.everyCharUntil('{');

export const SelectorToken = SelectorValidChars;
