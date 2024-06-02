export const EMPTY_COMPONENT_SHEET = Object.freeze({
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
  hash: 'unset',
});

export const defaultGroupState = Object.freeze({
  active: false,
  focus: false,
  hover: false,
  'group-active': false,
  'group-focus': false,
  'group-hover': false,
});

export const SHEET_EMPTY_ARRAY = Object.freeze([]) as Readonly<any[]>;
export const SHEET_EMPTY_OBJECT = Object.freeze({}) as Readonly<any>;
