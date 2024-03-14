import { ComponentInteractionState } from './types/styled.types';
import { observable } from './utils/observable';

export const REACT_FORWARD_REF_SYMBOL = Symbol.for('react.forward_ref');

export const INTERNAL_RESET = Symbol();
export const INTERNAL_SET = Symbol();
export const INTERNAL_FLAGS = Symbol();

export const STYLE_SCOPES = {
  /** @description Style is the same globally */
  GLOBAL: 0,
  /** @description Style is the same within a context (variables / containers) */
  CONTEXT: 1,
  /** @description Style can affect other styles (sets variables, uses other styles) */
  SELF: 2,
};

export const UpgradeState = {
  NONE: 0,
  SHOULD_UPGRADE: 1,
  UPGRADED: 2,
  WARNED: 3,
} as const;

export const DEFAULT_INTERACTIONS_STATE: ComponentInteractionState = Object.freeze({
  active: observable(false, { staticValue: true }),
  focus: observable(false, { staticValue: true }),
  hover: observable(false, { staticValue: true }),
  'group-active': observable(false, { staticValue: true }),
  'group-focus': observable(false, { staticValue: true }),
  'group-hover': observable(false, { staticValue: true }),
  group: observable(false, { staticValue: true }),
});
