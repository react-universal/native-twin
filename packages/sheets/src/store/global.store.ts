import type {
  TValidAppearancePseudoSelectors,
  TValidChildPseudoSelectors,
  TValidInteractionPseudoSelectors,
  TValidPlatformPseudoSelectors,
} from '../constants';
import type { IStyleType } from '../types';

function createStore<StoreShape>(initialState: StoreShape) {
  let currentState = initialState;

  const listeners = new Set<(state: StoreShape) => void>();
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  return {
    setState: (fn: (state: StoreShape) => StoreShape, publish = true) => {
      currentState = fn(currentState);
      if (publish) {
        listeners.forEach((listener) => listener(currentState));
      }
    },
    getState: () => {
      return currentState;
    },
    emitChanges: () => {
      listeners.forEach((listener) => listener(currentState));
    },
    subscribe,
  };
}

type TStylesRegistry = Map<string, IStyleType>;

export interface IRegisterComponentStore {
  parentID?: string;
  groupID?: string;
  id: string;
  styledProps?: {
    [key: string]: IComponentsStyleSheets;
  };
  meta: {
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
    hasGroupInteractions: boolean;
    isGroupParent: boolean;
    hasPointerInteractions: boolean;
  };
  styleSheet: IComponentsStyleSheets;
  interactionsState: Record<TValidInteractionPseudoSelectors, boolean>;
}
type TComponentsRegistry = Map<string, IRegisterComponentStore>;

export type IComponentsStyleSheets = {
  classNames?: string;
  styles: IStyleType[];
  classNamesSet: string[];
  interactionStyles: [TValidInteractionPseudoSelectors, IStyleType][];
  platformStyles: [TValidPlatformPseudoSelectors, IStyleType][];
  appearanceStyles: [TValidAppearancePseudoSelectors, IStyleType][];
  childStyles: [TValidChildPseudoSelectors, IStyleType][];
  getChildStyles(input: {
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  }): IStyleType[];
  // focus: IStyleType;
  // hover: IStyleType;
  // active: IStyleType;
  // 'group-hover': IStyleType;
  // 'group-focus': IStyleType;
  // 'group-active': IStyleType;
};

const globalStore = createStore({
  componentsRegistry: new Map() as TComponentsRegistry,
  stylesRegistry: new Map() as TStylesRegistry,
  componentStylesRegistry: new Map<number, IComponentsStyleSheets>(),
  processedClasses: new Set<string>(),
});

export { globalStore };
