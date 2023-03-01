import { useMemo } from 'react';
import type ComponentNode from '../../store/ComponentNode';
import { storeManager } from '../../store/StoreManager';
import type { TPseudoSelectorTypes } from '../../types/store.types';
import type { IStyleType } from '../../types/styles.types';

export interface UseComponentInteractionStateResponse {
  interactionStyle: IStyleType;
  state: boolean;
  setInteractionState: (value: boolean) => void;
}

const useComponentInteractionState = (
  component: ComponentNode,
  interactionName: TPseudoSelectorTypes,
) => {
  const interactionStyle = useMemo(() => {
    const interaction = component.styleSheet.interactionStyles.find(
      ([name]) => name === interactionName,
    );
    if (interaction) {
      return interaction[1].styles;
    }
    return null;
  }, [component, interactionName]);

  const setInteractionState = (value: boolean) => {
    storeManager.getState().setInteractionState(component, interactionName, value);
  };

  return {
    interactionStyle,
    state: component.interactionsState[interactionName],
    setInteractionState,
    interactionName,
  };
};

export { useComponentInteractionState };
