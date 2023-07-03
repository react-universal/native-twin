import { everyCharUntil } from '../lib/string.parser';

export const SelectorValidChars = everyCharUntil('{');

export const SelectorToken = SelectorValidChars;
