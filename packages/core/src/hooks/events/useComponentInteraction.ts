import { useCallback, useMemo } from 'react';
import { useSharedValue } from 'react-native-reanimated';
import type { IComponentInteractions, TPseudoSelectorTypes } from '../../types/store.types';

const useComponentInteraction = (
  interactionStyles: IComponentInteractions[],
  interactionName: TPseudoSelectorTypes,
) => {
  const state = useSharedValue(false);

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

export { useComponentInteraction };
