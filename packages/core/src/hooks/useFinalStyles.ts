import { Gesture } from 'react-native-gesture-handler';
import { useMemo } from 'react';
import { Appearance } from 'react-native';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';
import { useComponentInteraction, useContextComponentInteraction } from './events';

interface IFinalStylesArgs {
  normalStyles: IStyleType;
  interactionStyles: IComponentInteractions[];
  isGroupParent: boolean;
  componentProps: any;
}
const useFinalStyles = ({
  normalStyles,
  interactionStyles,
  isGroupParent,
}: IFinalStylesArgs) => {
  // DETERMINE IF THE COMPONENT HAS INTERACTIONS AND LEVEL OF INTERACTIONS
  const hasInteractions = useMemo(() => interactionStyles.length > 0, [interactionStyles]);
  const hasGroupInteractions = useMemo(
    () => interactionStyles.some((item) => item[0] === 'group-hover'),
    [interactionStyles],
  );
  // useComponentInteraction -> create interaction handler using reanimated
  const hoverInteraction = useComponentInteraction(interactionStyles, 'hover');
  const activeInteraction = useComponentInteraction(interactionStyles, 'active');
  const focusInteraction = useComponentInteraction(interactionStyles, 'focus');
  const groupHoverInteraction = useComponentInteraction(interactionStyles, 'group-hover');
  const isDark = useSharedValue(Appearance.getColorScheme() === 'dark');
  const parentGroupHoverInteraction = useContextComponentInteraction(
    interactionStyles,
    'group-hover',
  );

  const gesture = useMemo(() => {
    if (!hasInteractions) {
      return Gesture.Manual().enabled(false);
    }
    return Gesture.Manual()
      .onTouchesDown(() => {
        if (hasInteractions) {
          hoverInteraction.setInteractionState(true);
        }
        if (isGroupParent) {
          groupHoverInteraction.setInteractionState(true);
        }
      })
      .onTouchesUp(() => {
        if (hasInteractions) {
          hoverInteraction.setInteractionState(false);
        }
        if (isGroupParent) {
          groupHoverInteraction.setInteractionState(false);
        }
      })
      .enabled(hasInteractions)
      .manualActivation(true)
      .shouldCancelWhenOutside(false);
  }, [hasInteractions, isGroupParent, hoverInteraction, groupHoverInteraction]);

  const styles = useAnimatedStyle(() => {
    if (!isGroupParent && groupHoverInteraction && parentGroupHoverInteraction.state.value) {
      return {
        ...normalStyles,
        ...groupHoverInteraction.interactionStyle,
      };
    }
    if (hoverInteraction.state.value && hoverInteraction) {
      return {
        ...normalStyles,
        ...hoverInteraction.interactionStyle,
      };
    }
    return normalStyles;
  }, [hoverInteraction, parentGroupHoverInteraction, groupHoverInteraction, isGroupParent]);
  return {
    styles,
    hasInteractions,
    componentState: {
      hover: hoverInteraction.state,
      active: activeInteraction.state,
      focus: focusInteraction.state,
      'group-hover': groupHoverInteraction.state,
      dark: isDark,
    },
    gesture,
    hasGroupInteractions,
  };
};

export { useFinalStyles };
