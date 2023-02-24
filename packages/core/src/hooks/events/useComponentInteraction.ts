import { useMemo, useState } from 'react';
import { runOnJS } from 'react-native-reanimated';
import type { IComponentInteractions, TPseudoSelectorTypes } from '../../types/store.types';

const useComponentInteraction = (
  interactionStyles: IComponentInteractions[],
  interactionName: TPseudoSelectorTypes,
) => {
  const [state, dispatch] = useState(false);

  const interactionStyle = useMemo(() => {
    const interaction = interactionStyles.find(([name]) => name === interactionName);
    if (interaction) {
      return interaction[1].styles;
    }
    return {};
  }, [interactionStyles, interactionName]);

  const setInteractionState = (value: boolean) => {
    runOnJS(dispatch)(value);
  };

  return {
    interactionStyle,
    state,
    setInteractionState,
  };
};

export { useComponentInteraction };
