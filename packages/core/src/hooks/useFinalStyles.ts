import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type ComponentStyleSheet from '../store/ComponentStyleSheet';
import type { IUseComponentState } from './styled/useComponentState';
import { useIsDarkMode } from './useIsDarkMode';

interface IFinalStylesArgs {
  styleSheet: ComponentStyleSheet;
  isGroupParent: boolean;
  componentProps: any;
  componentState: IUseComponentState;
}
const useFinalStyles = ({
  styleSheet,
  isGroupParent,
  componentState,
  componentProps,
}: IFinalStylesArgs) => {
  const isDark = useIsDarkMode();
  // DETERMINE IF THE COMPONENT HAS INTERACTIONS AND LEVEL OF INTERACTIONS
  const hasInteractions = useMemo(
    () => styleSheet.interactionStyles.length > 0,
    [styleSheet.interactionStyles],
  );
  const hasGroupInteractions = useMemo(
    () => styleSheet.interactionStyles.some((item) => item[0] === 'group-hover'),
    [styleSheet.interactionStyles],
  );
  // useComponentInteraction -> create interaction handler using reanimated

  const styles = useMemo(() => {
    const sheet = [styleSheet.baseStyles];
    if (
      !isGroupParent &&
      hasGroupInteractions &&
      componentState.parentGroupHoverInteraction.state &&
      !!componentState.groupHoverInteraction.interactionStyle
    ) {
      sheet.push(componentState.groupHoverInteraction.interactionStyle);
    }
    if (componentProps?.isLastChild && componentState.lastChildInteraction.interactionStyle) {
      sheet.push(componentState.lastChildInteraction.interactionStyle);
    }
    if (
      componentState.hoverInteraction.state &&
      componentState.hoverInteraction.interactionStyle
    ) {
      sheet.push(componentState.hoverInteraction.interactionStyle);
    }
    if (isDark && componentState.colorScheme.interactionStyle) {
      sheet.push(componentState.colorScheme.interactionStyle);
    }
    return StyleSheet.flatten(sheet);
  }, [
    hasGroupInteractions,
    isGroupParent,
    componentState,
    isDark,
    componentProps,
    styleSheet.baseStyles,
  ]);
  return {
    styles,
    hasInteractions,
    hasGroupInteractions,
  };
};

export { useFinalStyles };
