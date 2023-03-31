import { StyleSheet } from 'react-native';
import type { TValidInteractionPseudoSelectors } from '../constants';
import type { IStyleType } from '../types';

type SubscriptionsCallBack<T> = (currentState: T) => void;

interface IRegisterComponentStore {
  [k: string]: {
    parentID?: string;
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

export const componentsStore = createInternalStore<IRegisterComponentStore>({});

export function setInteractionState(
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
  return true;
}

const registerComponentInStore = function (componentID: string, parentID?: string) {
  if (!Reflect.has(componentsStore, componentID)) {
    Reflect.set(componentsStore, componentID, {
      parentID,
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

function composeComponentStyledProps(
  interactionStyles: [TValidInteractionPseudoSelectors, IStyleType][],
  component: IRegisterComponentStore[string],
  componentStyles: IStyleType[],
) {
  const hoverStyles = interactionStyles.find(([selector]) => selector === 'hover');
  const groupHoverStyles = interactionStyles.find(([selector]) => selector === 'group-hover');
  const payload: IStyleType[] = [];
  if (component.interactionsState && component.interactionsState?.hover && hoverStyles) {
    // console.log('SHOULD_RETURN_HOVER');
    payload.push(hoverStyles[1]);
  }
  if (
    component.interactionsState &&
    component.interactionsState?.['group-hover'] &&
    groupHoverStyles
  ) {
    payload.push(groupHoverStyles[1]);
  }
  return StyleSheet.flatten([...componentStyles, ...payload]);
}

export { createInternalStore, registerComponentInStore, composeComponentStyledProps };
