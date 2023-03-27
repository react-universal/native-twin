import { immerable } from 'immer';
import uuid from 'react-native-uuid';
import ComponentStyleSheet from '../sheets/ComponentStyleSheet';
import type { IStyleProp, StyledProps, TInteractionPseudoSelectors } from '../types';
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

export default class ComponentNode<T = Object> {
  id: string;
  [immerable] = true;
  inlineStyles: IStyleProp;
  styleSheets: Record<string, IComponentStyleSheets<any>>;
  parentComponentID?: string;
  interactionsState: Record<TInteractionPseudoSelectors, boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
  };
  appearanceState: Pick<StyledProps<keyof T>, 'isFirstChild' | 'isLastChild' | 'nthChild'>;
  constructor(component: IRegisterComponentArgs) {
    this.parentComponentID = component.parentID;
    this.id = createID() as string;
    this.inlineStyles = component.inlineStyles;
    this.styleSheets = Object.entries(component.classProps).reduce((prev, current) => {
      const [classProp, propClassName] = current;
      prev[classProp] = {
        classProp: classProp,
        className: propClassName,
        styles: new ComponentStyleSheet(propClassName),
      };
      return prev;
    }, {} as typeof this.styleSheets);
    this.appearanceState = {
      isFirstChild: component.isFirstChild,
      isLastChild: component.isFirstChild,
      nthChild: component.nthChild,
    };
  }

  setInteractionState(interaction: TInteractionPseudoSelectors, value: boolean) {
    this.interactionsState[interaction] = value;
  }

  // getInteractionStyles(interaction: TInteractionPseudoSelectors) {
  //   return this.styleSheet.interactionStyles.find(([name]) => name === interaction);
  // }

  get getStyleProps() {
    const sheets = Object.values(this.styleSheets);
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

  // get styles() {
  //   const styles = [this.styleSheets.baseStyles, this.inlineStyles];
  //   const hoverInteraction = this.getInteractionStyles('hover');
  //   const groupHoverInteraction = this.getInteractionStyles('group-hover');
  //   if (this.interactionsState['group-hover'] && groupHoverInteraction) {
  //     styles.push(groupHoverInteraction[1].styles);
  //   }
  //   if (this.interactionsState.hover && hoverInteraction) {
  //     styles.push(hoverInteraction[1].styles);
  //   }
  //   return StyleSheet.flatten(styles);
  // }

  get getStyleSheetInteractions() {
    let hasGroupInteractions = false;
    let hasPointerInteractions = false;
    let isGroupParent = false;

    for (const currentStyle of Object.values(this.styleSheets)) {
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

  // getChildStyles(props: TInternalStyledComponentProps) {
  //   const styles: IStyleType[] = [];
  //   const firstChildStyles = this.styleSheet.appearanceStyles.find(
  //     ([selector]) => selector === 'first',
  //   );
  //   const evenChildStyles = this.styleSheet.appearanceStyles.find(
  //     ([selector]) => selector === 'even',
  //   );
  //   const oddChildStyles = this.styleSheet.appearanceStyles.find(
  //     ([selector]) => selector === 'odd',
  //   );
  //   const lastChildStyles = this.styleSheet.appearanceStyles.find(
  //     ([selector]) => selector === 'last',
  //   );
  //   if (props.isFirstChild && firstChildStyles) {
  //     styles.push(firstChildStyles[1].styles);
  //   }
  //   if (props.isLastChild && lastChildStyles) {
  //     styles.push(lastChildStyles[1].styles);
  //   }
  //   if (props.nthChild % 2 === 0 && evenChildStyles) {
  //     styles.push(evenChildStyles[1].styles);
  //   }
  //   if (props.nthChild % 2 !== 0 && oddChildStyles) {
  //     styles.push(oddChildStyles[1].styles);
  //   }
  //   return StyleSheet.flatten(styles) as IStyleType;
  // }
}
