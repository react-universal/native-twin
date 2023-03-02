import { immerable } from 'immer';
import type { IRegisterComponentArgs } from '../types/store.types';
import type { TInteractionPseudoSelectors } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import ComponentStyleSheet from './ComponentStyleSheet';

export default class ComponentNode {
  id: string;
  [immerable] = true;
  inlineStyles: IStyleType;
  styleSheet: ComponentStyleSheet;
  interactionsState: Record<TInteractionPseudoSelectors, boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
  };
  constructor(component: IRegisterComponentArgs) {
    this.id = component.id;
    this.inlineStyles = component.inlineStyles;
    this.styleSheet = new ComponentStyleSheet(component.className);
  }

  setInteractionState(interaction: TInteractionPseudoSelectors, value: boolean) {
    this.interactionsState[interaction] = value;
  }

  getInteractionStyle(interaction: TInteractionPseudoSelectors) {
    return this.styleSheet.interactionStyles.find(([name]) => name === interaction);
  }

  get styles() {
    const styles = [this.styleSheet.baseStyles];
    const hoverInteraction = this.getInteractionStyle('hover');
    if (this.interactionsState.hover && hoverInteraction) {
      styles.push(hoverInteraction[1].styles);
    }
    return styles;
  }

  get hasPointerInteractions() {
    return this.styleSheet.interactionStyles.length > 0;
  }

  get isGroupParent() {
    return this.styleSheet.classNameSet.has('group');
  }

  get hasGroupInteractions() {
    return this.styleSheet.interactionStyles.some(([name]) => name.startsWith('group-'));
  }
}
