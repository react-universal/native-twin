import { getSelectorGroup } from '../helpers';
import { string } from '../lib';

export const SelectorValidChars = string.everyCharUntil('{').map(
  (x) =>
    ({
      value: x,
      group: getSelectorGroup(x),
    } as const),
);

export const SelectorToken = SelectorValidChars;
