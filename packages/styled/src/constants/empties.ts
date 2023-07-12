import { hash } from '@universal-labs/twind-adapter';

export const defaultGroupState = Object.freeze({
  active: false,
  focus: false,
  hover: false,
  'group-active': false,
  'group-focus': false,
  'group-hover': false,
});

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
