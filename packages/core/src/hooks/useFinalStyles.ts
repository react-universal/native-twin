import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import type { IUseComponentState } from './styled/useComponentState';
import { useIsDarkMode } from './useIsDarkMode';

interface IFinalStylesArgs {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  isGroupParent: boolean;
  componentProps: any;
  componentState: IUseComponentState;
}
const useFinalStyles = ({
  normalStyles,
  interactionStyles,
  isGroupParent,
  componentState,
}: IFinalStylesArgs) => {
  const isDark = useIsDarkMode();
  // DETERMINE IF THE COMPONENT HAS INTERACTIONS AND LEVEL OF INTERACTIONS
  const hasInteractions = useMemo(() => interactionStyles.length > 0, [interactionStyles]);
  const hasGroupInteractions = useMemo(
    () => interactionStyles.some((item) => item[0] === 'group-hover'),
    [interactionStyles],
  );
  // useComponentInteraction -> create interaction handler using reanimated

  const styles = useMemo(() => {
    const styleSheet = [normalStyles];
    if (
      !isGroupParent &&
      hasGroupInteractions &&
      componentState.parentGroupHoverInteraction.state &&
      componentState.groupHoverInteraction.interactionStyle
    ) {
      styleSheet.push(componentState.groupHoverInteraction.interactionStyle);
    }
    if (
      componentState.hoverInteraction.state &&
      componentState.hoverInteraction.interactionStyle
    ) {
      styleSheet.push(componentState.hoverInteraction.interactionStyle);
    }
    if (isDark && componentState.colorScheme.interactionStyle) {
      styleSheet.push(componentState.colorScheme.interactionStyle);
    }
    return StyleSheet.flatten(styleSheet);
  }, [hasGroupInteractions, isGroupParent, normalStyles, componentState, isDark]);
  return {
    styles,
    hasInteractions,
    hasGroupInteractions,
  };
};

export { useFinalStyles };
