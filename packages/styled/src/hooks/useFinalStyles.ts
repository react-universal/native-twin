import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { IStyleType, IComponentInteractions } from '@react-universal/core';
import type { IGroupContext } from '../context/GroupContext';
import type { IComponentState } from '../styled.types';

interface IFinalStylesArgs {
  componentState: IComponentState;
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  groupContext: IGroupContext;
  isGroupParent: boolean;
}
const useFinalStyles = ({
  componentState,
  normalStyles,
  interactionStyles,
  groupContext,
  isGroupParent,
}: IFinalStylesArgs) => {
  const styles = useMemo(() => {
    if (
      !isGroupParent &&
      groupContext &&
      groupContext.isHover &&
      componentState['group-hover']
    ) {
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
  }, [groupContext, componentState, normalStyles, interactionStyles, isGroupParent]);
  return styles;
};

export { useFinalStyles };
