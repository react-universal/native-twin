import type {
  TValidAppearancePseudoSelectors,
  TValidChildPseudoSelectors,
  TValidInteractionPseudoSelectors,
  TValidPlatformPseudoSelectors,
} from '../constants';
import type { IStyleType } from '../types';
import type ComponentNode from './ComponentNode';

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
    classNames: string;
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
    hasGroupInteractions: boolean;
    isGroupParent: boolean;
    hasPointerInteractions: boolean;
    parentID?: string;
    groupID?: string;
  };
  styleSheet: IComponentsStyleSheets;
  interactionsState: Record<TValidInteractionPseudoSelectors, boolean>;
}
type TComponentsRegistry = Map<string, ComponentNode>;

export type IComponentsStyleSheets = {
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
};

const globalStore = createStore({
  componentsRegistry: new Map() as TComponentsRegistry,
  stylesRegistry: new Map() as TStylesRegistry,
  componentStylesRegistry: new Map<number, IComponentsStyleSheets>(),
  processedClasses: new Set<string>(),
});

export { globalStore };
