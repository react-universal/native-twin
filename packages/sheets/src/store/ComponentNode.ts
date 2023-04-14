import { immerable } from 'immer';
import type { ValidGroupPseudoSelector, ValidInteractionPseudoSelector } from '../constants';

export interface ComponentNodeInput {
  componentID: string;
  stylesheetID: string;
}
export default class ComponentNode {
  [immerable] = true;
  id: string;
  interactionsState: Record<
    ValidInteractionPseudoSelector | ValidGroupPseudoSelector,
    boolean
  > = {
    'group-active': false,
    'group-focus': false,
    'group-hover': false,
    active: false,
    focus: false,
    hover: false,
  };
  constructor(input: ComponentNodeInput) {
    this.id = input.componentID;
    this.interactionsState = {
      'group-active': false,
      'group-focus': false,
      'group-hover': false,
      active: false,
      focus: false,
      hover: false,
    };
  }
}
