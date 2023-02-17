import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type {
  IComponentState,
  IStyleType,
  IComponentInteractions,
} from '@react-universal/core';
import { useInteractionsContext } from '../context/InteractionsContext';

interface IFinalStylesArgs {
  componentState: IComponentState;
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
}
const useFinalStyles = ({
  componentState,
  normalStyles,
  interactionStyles,
}: IFinalStylesArgs) => {
  const interactionsContext = useInteractionsContext();
  const styles = useMemo(() => {
    let interactionsHover = false;
    if (interactionsContext && interactionsContext.isHover) {
      interactionsHover = true;
    }
    if (componentState.hover || interactionsHover) {
      return StyleSheet.flatten([
        normalStyles,
        interactionStyles.find(([name]) => name === 'hover')?.[1].styles,
      ]);
    }
    return StyleSheet.flatten([normalStyles]);
  }, [interactionsContext, componentState.hover, normalStyles, interactionStyles]);
  return styles;
};

export { useFinalStyles };
