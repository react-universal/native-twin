import { Appearance, StyleSheet } from 'react-native';
import { immerable } from 'immer';
import uuid from 'react-native-uuid';
import type {
  TValidAppearancePseudoSelectors,
  TValidChildPseudoSelectors,
  TValidInteractionPseudoSelectors,
} from '../constants';
import ComponentStyleSheet from '../sheets/ComponentStyleSheet';
import type { IInteractionPayload, IStyleProp } from '../types';
import type { IRegisterComponentArgs } from '../types/store.types';

const createID = () => {
  if (process && process.env['NODE_ENV'] === 'test') {
    return 'test-parent';
  }
  return uuid.v4();
};

interface IComponentStyleSheets<T> {
  classProp: keyof T;
  className: string;
  styles: ComponentStyleSheet;
}

export default class ComponentNode {
  [immerable] = true;

  id: string;
  inlineStyles: IStyleProp;
  styledProps: Record<string, IComponentStyleSheets<any>>;
  style: ComponentStyleSheet;
  parentComponentID?: string;
  interactionsState: Record<TValidInteractionPseudoSelectors, boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
  };
  appearanceState: Record<TValidAppearancePseudoSelectors, boolean>;
  childStyles: [TValidChildPseudoSelectors, IInteractionPayload][] = [];

  constructor(component: IRegisterComponentArgs) {
    this.parentComponentID = component.parentID;
    this.id = createID() as string;
    this.inlineStyles = component.inlineStyles;
    this.style = new ComponentStyleSheet(component.className);
    this.appearanceState = {
      dark: Appearance.getColorScheme() === 'dark',
    };
    this.styledProps =
      component.classPropsTuple?.reduce((prev, current) => {
        const [classProp, propClassName] = current;
        const createdStyles = new ComponentStyleSheet(propClassName);
        prev[classProp] = {
          classProp: classProp,
          className: propClassName,
          styles: createdStyles,
        };
        this.childStyles = this.childStyles.concat(createdStyles.childStyles);
        return prev;
      }, {} as typeof this.styledProps) || {};
  }

  getChildStyles(style: TValidChildPseudoSelectors) {
    return this.childStyles.find((d) => d[0] === style)?.[1];
  }

  setInteractionState(interaction: TValidInteractionPseudoSelectors, value: boolean) {
    if (interaction === 'hover' || interaction === 'active') {
      this.interactionsState['hover'] = value;
      this.interactionsState['active'] = value;
      return;
    }
    this.interactionsState[interaction] = value;
  }

  get stylesheet() {
    const payload: IStyleProp[] = [this.style.baseStyles, this.inlineStyles];
    const hoverInteraction = this.style.interactionStyles.find(([name]) => name === 'hover');
    const activeInteraction = this.style.interactionStyles.find(([name]) => name === 'active');
    const focusInteraction = this.style.interactionStyles.find(([name]) => name === 'focus');
    const groupHoverInteraction = this.style.interactionStyles.find(
      ([name]) => name === 'group-hover',
    );
    if (this.interactionsState['group-hover'] && groupHoverInteraction) {
      payload.push(groupHoverInteraction[1].styles);
    }
    if (this.interactionsState['hover'] && hoverInteraction) {
      payload.push(hoverInteraction[1].styles);
    }
    if (this.interactionsState['active'] && activeInteraction) {
      payload.push(activeInteraction[1].styles);
    }
    if (this.interactionsState['focus'] && focusInteraction) {
      payload.push(focusInteraction[1].styles);
    }
    return StyleSheet.flatten(payload);
  }

  get getStyleProps() {
    const sheets = Object.values(this.styledProps);
    return sheets.reduce((prev, current) => {
      if (typeof current.classProp === 'string') {
        if (!prev[current.classProp]) {
          prev[current.classProp] = [
            current.styles.baseStyles,
            this.inlineStyles && this.inlineStyles,
          ];
        }
        const hoverInteraction = current.styles.interactionStyles.find(
          ([name]) => name === 'hover',
        );
        const groupHoverInteraction = current.styles.interactionStyles.find(
          ([name]) => name === 'group-hover',
        );
        if (this.interactionsState['group-hover'] && groupHoverInteraction) {
          prev[current.classProp]?.push(groupHoverInteraction[1].styles);
        }
        if (this.interactionsState['hover'] && hoverInteraction) {
          prev[current.classProp]?.push(hoverInteraction[1].styles);
        }
      }
      return prev;
    }, {} as Record<string, IStyleProp[]>);
  }

  get getStyleSheetInteractions() {
    let hasGroupInteractions = this.style.interactionStyles.some(([name]) =>
      name.includes('group-'),
    );
    let hasPointerInteractions = this.style.interactionStyles.length > 0;
    let isGroupParent = this.style.classNameSet.has('group');

    if (hasGroupInteractions && hasPointerInteractions && isGroupParent) {
      return { hasGroupInteractions, hasPointerInteractions, isGroupParent };
    }

    for (const currentStyle of Object.values(this.styledProps)) {
      if (currentStyle.styles.interactionStyles)
        if (currentStyle.styles.interactionStyles.length > 0) {
          hasPointerInteractions = true;
        }
      if (currentStyle.styles.classNameSet.has('group')) {
        isGroupParent = true;
      }
      if (currentStyle.styles.interactionStyles.some(([name]) => name.includes('group-'))) {
        hasGroupInteractions = true;
      }
    }
    return {
      hasGroupInteractions,
      hasPointerInteractions,
      isGroupParent,
    };
  }

  get hasPointerInteractions() {
    return this.getStyleSheetInteractions.hasPointerInteractions;
  }

  get isGroupParent() {
    return this.getStyleSheetInteractions.isGroupParent;
  }

  get hasGroupInteractions() {
    return this.getStyleSheetInteractions.hasGroupInteractions;
  }
}
