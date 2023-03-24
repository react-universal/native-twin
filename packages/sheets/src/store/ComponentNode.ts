import { StyleSheet } from 'react-native';
import { immerable } from 'immer';
import uuid from 'react-native-uuid';
import ComponentStyleSheet from '../sheets/ComponentStyleSheet';
import type {
  IStyleType,
  TInteractionPseudoSelectors,
  TInternalStyledComponentProps,
} from '../types';
import type { IExtraProperties, IRegisterComponentArgs } from '../types/store.types';

const createID = () => uuid.v4();

// interface IComponentStyleSheets {
//   className: string;
//   styles: ComponentStyleSheet;
// }

export default class ComponentNode {
  id: string;
  [immerable] = true;
  inlineStyles: IExtraProperties<{ inlineStyles: IStyleType }>['style'];
  styleSheet: ComponentStyleSheet;
  // styleSheets: Record<string, IComponentStyleSheets>;
  parentComponentID?: string;
  interactionsState: Record<TInteractionPseudoSelectors, boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
  };
  appearanceState: Omit<TInternalStyledComponentProps, 'parentID'>;
  constructor(component: IRegisterComponentArgs) {
    this.parentComponentID = component.parentID;
    this.id = createID() as string;
    this.inlineStyles = component.inlineStyles;
    this.styleSheet = new ComponentStyleSheet(component.className);
    // this.styleSheets = Object.entries(component.classProps).reduce((prev, current) => {
    //   const [classProp, propClassName] = current;
    //   prev[classProp] = {
    //     className: propClassName,
    //     styles: new ComponentStyleSheet(classProp),
    //   };
    //   return prev;
    // }, {} as typeof this.styleSheets);
    this.appearanceState = {
      isFirstChild: component.isFirstChild,
      isLastChild: component.isFirstChild,
      nthChild: component.nthChild,
    };
  }

  setInteractionState(interaction: TInteractionPseudoSelectors, value: boolean) {
    this.interactionsState[interaction] = value;
  }

  getInteractionStyles(interaction: TInteractionPseudoSelectors) {
    return this.styleSheet.interactionStyles.find(([name]) => name === interaction);
  }

  get styles() {
    const styles = [this.styleSheet.baseStyles, this.inlineStyles];
    const hoverInteraction = this.getInteractionStyles('hover');
    const groupHoverInteraction = this.getInteractionStyles('group-hover');
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

  getChildStyles(props: TInternalStyledComponentProps) {
    const styles: IStyleType[] = [];
    const firstChildStyles = this.styleSheet.appearanceStyles.find(
      ([selector]) => selector === 'first',
    );
    const evenChildStyles = this.styleSheet.appearanceStyles.find(
      ([selector]) => selector === 'even',
    );
    const oddChildStyles = this.styleSheet.appearanceStyles.find(
      ([selector]) => selector === 'odd',
    );
    const lastChildStyles = this.styleSheet.appearanceStyles.find(
      ([selector]) => selector === 'last',
    );
    if (props.isFirstChild && firstChildStyles) {
      styles.push(firstChildStyles[1].styles);
    }
    if (props.isLastChild && lastChildStyles) {
      styles.push(lastChildStyles[1].styles);
    }
    if (props.nthChild % 2 === 0 && evenChildStyles) {
      styles.push(evenChildStyles[1].styles);
    }
    if (props.nthChild % 2 !== 0 && oddChildStyles) {
      styles.push(oddChildStyles[1].styles);
    }
    return StyleSheet.flatten(styles) as IStyleType;
  }
}
