import { useMemo } from 'react';
import { useTailwindContext } from '../../context/TailwindContext';
import type { IComponentInteractions, TPseudoSelectorTypes } from '../../types/store.types';

const useContextComponentInteractionState = (
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

  return {
    interactionStyle,
    state,
  };
};

export { useContextComponentInteractionState };
