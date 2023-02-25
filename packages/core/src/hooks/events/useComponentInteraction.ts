import { useMemo, useState } from 'react';
import type { IComponentInteractions, TPseudoSelectorTypes } from '../../types/store.types';
import type { IStyleType } from '../../types/styles.types';

export interface UseComponentInteractionStateResponse {
  interactionStyle: IStyleType;
  state: boolean;
  setInteractionState: (value: boolean) => void;
}

const useComponentInteractionState = (
  interactionStyles: IComponentInteractions[],
  interactionName: TPseudoSelectorTypes,
) => {
  const [state, dispatch] = useState(false);

  const interactionStyle = useMemo(() => {
    const interaction = interactionStyles.find(([name]) => name === interactionName);
    if (interaction) {
      return interaction[1].styles;
    }
    return null;
  }, [interactionStyles, interactionName]);

  const setInteractionState = (value: boolean) => {
    dispatch(value);
  };

  return {
    interactionStyle,
    state,
    setInteractionState,
  };
};

export { useComponentInteractionState };
