import type {
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
} from '../constants/ValidPseudoElements';

export interface ComponentNodeInput {
  componentID: string;
  stylesheetID: string;
  groupID: string;
}
export default class ComponentNode {
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
    this.setInteractionState = this.setInteractionState.bind(this);
  }

  setInteractionState(
    interaction: ValidInteractionPseudoSelector | ValidGroupPseudoSelector,
    value: boolean,
  ) {
    this.interactionsState = {
      ...this.interactionsState,
      [interaction]: value,
    };
  }
}
