import { Appearance, Platform, StyleSheet } from 'react-native';
import type {
  TValidAppearancePseudoSelectors,
  TValidInteractionPseudoSelectors,
  TValidPlatformPseudoSelectors,
} from '../constants';
import type { IStyleType } from '../types';

type SubscriptionsCallBack<T> = (currentState: T) => void;

interface IRegisterComponentStore {
  [k: string]: {
    parentID?: string;
    meta: {
      isFirstChild: boolean;
      isLastChild: boolean;
      nthChild: number;
    };
    interactionsState: Record<TValidInteractionPseudoSelectors, boolean>;
  };
}

function createInternalStore<StoreShape extends object>(initialState: StoreShape) {
  const listeners = new Set<SubscriptionsCallBack<StoreShape>>();
  const subscribe = (listener: (state: StoreShape) => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  return new Proxy(
    {
      ...initialState,
      subscribe,
    },
    {
      get(target: StoreShape, key: string, receiver) {
        return Reflect.get(target, key, receiver);
      },
      set(target, key, value, receiver) {
        Reflect.set(target, key, value, receiver);
        listeners.forEach((l) => l(target));
        return true;
      },
      getOwnPropertyDescriptor(target, key) {
        return Reflect.getOwnPropertyDescriptor(target, key);
      },
      has(target, key) {
        return Reflect.has(target, key);
      },
      ownKeys(target) {
        return Reflect.ownKeys(target);
      },
    },
  ) as StoreShape & {
    subscribe: typeof subscribe;
  };
}

const componentsStore = createInternalStore<IRegisterComponentStore>({});

const registerComponentInStore = function (
  componentID: string,
  meta: {
    parentID?: string;
    isFirstChild: boolean;
    isLastChild: boolean;
    nthChild: number;
  },
) {
  if (!Reflect.has(componentsStore, componentID)) {
    Reflect.set(componentsStore, componentID, {
      parentID: meta.parentID,
      meta,
      interactionsState: {
        'group-hover': false,
        active: false,
        focus: false,
        hover: false,
      },
    });
  }
  return Reflect.get(componentsStore, componentID);
};
function composeStylesForPseudoClasses<T extends string>(
  styleTuples: [T, IStyleType][],
  pseudoSelector: T,
) {
  // console.log('stylesTuple', styleTuples);
  return styleTuples
    .filter(([selectorName]) => selectorName === pseudoSelector)
    .map(([, selectorStyles]) => selectorStyles);
}

function setInteractionState(
  id: string,
  interaction: TValidInteractionPseudoSelectors,
  value: boolean,
) {
  componentsStore[id] = {
    ...componentsStore[id]!,
    interactionsState: {
      ...componentsStore[id]!.interactionsState,
      [interaction]: value,
    },
  };
  // Object.keys(componentsStore).
  return true;
}

function composeComponentStyledProps(
  interactionStyles: [TValidInteractionPseudoSelectors, IStyleType][],
  platformStyles: [TValidPlatformPseudoSelectors, IStyleType][],
  appearanceStyles: [TValidAppearancePseudoSelectors, IStyleType][],
  component: IRegisterComponentStore[string],
  componentStyles: IStyleType[],
) {
  const hoverStyles = composeStylesForPseudoClasses(interactionStyles, 'hover');
  const groupHoverStyles = composeStylesForPseudoClasses(interactionStyles, 'group-hover');
  const activeStyles = composeStylesForPseudoClasses(interactionStyles, 'active');
  const focusStyles = composeStylesForPseudoClasses(interactionStyles, 'focus');
  const payload: IStyleType[] = [];
  // Important: order matters
  // 1. Platform styles
  if (Platform.OS !== 'web') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'native'));
  }
  if (Platform.OS === 'ios') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'ios'));
  }
  if (Platform.OS === 'android') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'android'));
  }
  if (Platform.OS === 'web') {
    payload.push(...composeStylesForPseudoClasses(platformStyles, 'web'));
  }
  // 2. Appearance styles
  if (Appearance.getColorScheme() === 'dark') {
    payload.push(...composeStylesForPseudoClasses(appearanceStyles, 'dark'));
  }
  // 2. Interaction styles
  if (
    component.interactionsState &&
    (component.interactionsState?.active || component.interactionsState?.hover) &&
    activeStyles
  ) {
    payload.push(...activeStyles);
  }
  if (component.interactionsState && component.interactionsState?.focus && focusStyles) {
    payload.push(...focusStyles);
  }
  if (component.interactionsState && component.interactionsState?.hover && hoverStyles) {
    payload.push(...hoverStyles);
  }
  if (
    component.interactionsState &&
    component.interactionsState?.['group-hover'] &&
    groupHoverStyles
  ) {
    payload.push(...groupHoverStyles);
  }
  return StyleSheet.flatten([...componentStyles, ...payload]);
}

export {
  createInternalStore,
  registerComponentInStore,
  composeComponentStyledProps,
  setInteractionState,
  componentsStore,
  composeStylesForPseudoClasses,
};
