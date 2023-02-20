import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { IStyleType, IComponentInteractions } from '@react-universal/core';
import type { ITailwindContext } from '../context/TailwindContext';
import type { IComponentState } from '../styled.types';

interface IFinalStylesArgs {
  componentState: IComponentState;
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  tailwindContext: ITailwindContext;
  isGroupParent: boolean;
}
const useFinalStyles = ({
  componentState,
  normalStyles,
  interactionStyles,
  tailwindContext,
  isGroupParent,
}: IFinalStylesArgs) => {
  const styles = useMemo(() => {
    if (!isGroupParent && tailwindContext.parentState.hover && componentState['group-hover']) {
      return StyleSheet.flatten([
        normalStyles,
        interactionStyles.find(([name]) => name === 'group-hover')?.[1].styles,
      ]);
    }
    if (componentState.hover) {
      return StyleSheet.flatten([
        normalStyles,
        interactionStyles.find(([name]) => name === 'hover')?.[1].styles,
      ]);
    }
    return StyleSheet.flatten([normalStyles]);
  }, [tailwindContext, componentState, normalStyles, interactionStyles, isGroupParent]);
  return styles;
};

export { useFinalStyles };
