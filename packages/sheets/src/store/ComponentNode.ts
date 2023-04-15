import { immerable } from 'immer';
import type { ValidGroupPseudoSelector, ValidInteractionPseudoSelector } from '../constants';

export interface ComponentNodeInput {
  componentID: string;
  stylesheetID: string;
  groupID: string;
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
  groupID: string;
  stylesheetID: string;
  constructor(input: ComponentNodeInput) {
    this.id = input.componentID;
    this.groupID = input.groupID;
    this.stylesheetID = input.stylesheetID;
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
