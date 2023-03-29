import { Appearance } from 'react-native';
import { immerable } from 'immer';
import uuid from 'react-native-uuid';
import type {
  AppearancePseudoSelectors,
  ChildPseudoSelectors,
  InteractionPseudoSelectors,
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
  id: string;
  [immerable] = true;
  inlineStyles: IStyleProp;
  styleSheets: Record<string, IComponentStyleSheets<any>>;
  parentComponentID?: string;
  interactionsState: Record<(typeof InteractionPseudoSelectors)[number], boolean> = {
    hover: false,
    focus: false,
    active: false,
    'group-hover': false,
  };
  appearanceState: Record<(typeof AppearancePseudoSelectors)[number], boolean>;
  childStyles: [(typeof ChildPseudoSelectors)[number], IInteractionPayload][] = [];
  constructor(component: IRegisterComponentArgs) {
    this.parentComponentID = component.parentID;
    this.id = createID() as string;
    this.inlineStyles = component.inlineStyles;
    this.styleSheets = Object.entries(component.classProps).reduce((prev, current) => {
      const [classProp, propClassName] = current;
      const createdStyles = new ComponentStyleSheet(propClassName);
      prev[classProp] = {
        classProp: classProp,
        className: propClassName,
        styles: createdStyles,
      };
      this.childStyles = this.childStyles.concat(createdStyles.childStyles);
      return prev;
    }, {} as typeof this.styleSheets);
    this.appearanceState = {
      // first: component.isFirstChild,
      // last: component.isLastChild,
      // even: component.nthChild % 2 === 0,
      // odd: component.nthChild % 2 !== 0,
      dark: Appearance.getColorScheme() === 'dark',
      // android: Platform.OS === 'android',
      // ios: Platform.OS === 'ios',
      // web: Platform.OS === 'web',
      // native: Platform.OS !== 'web',
    };
  }

  getChildStyles(style: (typeof ChildPseudoSelectors)[number]) {
    return this.childStyles.find((d) => d[0] === style)?.[1];
  }

  setInteractionState(
    interaction: (typeof InteractionPseudoSelectors)[number],
    value: boolean,
  ) {
    this.interactionsState[interaction] = value;
  }

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
}
