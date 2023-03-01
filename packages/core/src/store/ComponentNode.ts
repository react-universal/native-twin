import { immerable } from 'immer';
import type { IRegisterComponentArgs } from '../types/store.types';
import type { TPseudoSelectorTypes } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import ComponentStyleSheet from './ComponentStyleSheet';

export default class ComponentNode {
  id: string;
  [immerable] = true;
  classNames?: string;
  inlineStyles: IStyleType;
  styleSheet: ComponentStyleSheet;
  interactionsState: Record<TPseudoSelectorTypes, boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
    dark: false,
    first: false,
    group: false,
    last: false,
  };
  constructor(component: IRegisterComponentArgs) {
    this.id = component.id;
    this.classNames = component.className;
    this.inlineStyles = component.inlineStyles;
    this.styleSheet = new ComponentStyleSheet(this.classNames);
  }

  setInteractionState(interaction: TPseudoSelectorTypes, value: boolean) {
    this.interactionsState[interaction] = value;
  }
}
