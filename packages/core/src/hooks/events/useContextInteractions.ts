import { useCallback, useMemo } from 'react';
import { useTailwindContext } from '../../context/TailwindContext';
import type { IComponentInteractions, TPseudoSelectorTypes } from '../../types/store.types';

const useContextComponentInteraction = (
  interactionStyles: IComponentInteractions[],
  interactionName: TPseudoSelectorTypes,
) => {
  const tailwindContext = useTailwindContext();
  const state = tailwindContext.parentState[interactionName];

  const interactionStyle = useMemo(() => {
    const interaction = interactionStyles.find(([name]) => name === interactionName);
    if (interaction) {
      return interaction[1].styles;
    }
    return {};
  }, [interactionStyles, interactionName]);

  const setInteractionState = useCallback(
    (value: boolean) => {
      state.value = value;
    },
    [state],
  );

  return {
    interactionStyle,
    state,
    setInteractionState,
  };
};

export { useContextComponentInteraction };
