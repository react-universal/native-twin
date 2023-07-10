import { hash } from '@universal-labs/twind-adapter';

export const EMPTY_ARRAY = Object.freeze([]) as Readonly<any[]>;
export const EMPTY_OBJECT = Object.freeze({}) as Readonly<any>;

export const EMPTY_SHEET = Object.freeze({
  styles: {
    base: {},
    pointer: {},
    group: {},
    even: {},
    first: {},
    last: {},
    odd: {},
  },
  isGroupParent: false,
  hasPointerEvents: false,
  hasGroupEvents: false,
  hash: hash('unstyled'),
});
