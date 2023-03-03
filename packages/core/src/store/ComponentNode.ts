import { StyleSheet } from 'react-native';
import { init } from '@paralleldrive/cuid2';
import { immerable } from 'immer';
import type { IRegisterComponentArgs } from '../types/store.types';
import type { TInteractionPseudoSelectors } from '../types/store.types';
import type { IExtraProperties } from '../types/styles.types';
import ComponentStyleSheet from './ComponentStyleSheet';

const createID = init({ fingerprint: 'tailwind-native', length: 10 });

export default class ComponentNode {
  id: string;
  [immerable] = true;
  inlineStyles: IExtraProperties<{}>['style'];
  styleSheet: ComponentStyleSheet;
  parentComponentID?: string;
  interactionsState: Record<TInteractionPseudoSelectors, boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
  };
  appearanceState = {};
  constructor(component: IRegisterComponentArgs) {
    this.parentComponentID = component.parentID;
    this.id = createID();
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
    const groupHoverInteraction = this.getInteractionStyle('group-hover');
    if (this.interactionsState['group-hover'] && groupHoverInteraction) {
      styles.push(groupHoverInteraction[1].styles);
    }
    if (this.interactionsState.hover && hoverInteraction) {
      styles.push(hoverInteraction[1].styles);
    }
    return StyleSheet.flatten(styles);
  }

  get hasPointerInteractions() {
    return this.styleSheet.interactionStyles.length > 0 || this.isGroupParent;
  }

  get isGroupParent() {
    return this.styleSheet.classNameSet.has('group');
  }

  get hasGroupInteractions() {
    return this.styleSheet.interactionStyles.some(([name]) => name.startsWith('group-'));
  }
}
