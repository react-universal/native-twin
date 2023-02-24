import { LongPressGestureHandlerGestureEvent, Gesture } from 'react-native-gesture-handler';
import { useMemo } from 'react';
import { Appearance } from 'react-native';
import {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useTailwindContext } from '../context/TailwindContext';
import type { IComponentInteractions } from '../types/store.types';
import type { IStyleType } from '../types/styles.types';

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
  const tailwindContext = useTailwindContext();
  const hasInteractions = useMemo(() => interactionStyles.length > 0, [interactionStyles]);
  const hasGroupInteractions = useMemo(
    () => interactionStyles.some((item) => item[0] === 'group-hover'),
    [interactionStyles],
  );
  const isHover = useSharedValue(false);
  const isActive = useSharedValue(false);
  const isFocus = useSharedValue(false);
  const isDark = useSharedValue(Appearance.getColorScheme() === 'dark');
  const isGroupHover = useSharedValue(false);
  const isParentGroupHover = tailwindContext.parentState['group-hover'];
  const gesture = Gesture.Manual()
    .onTouchesDown(() => {
      if (hasInteractions) {
        isHover.value = true;
      }
      if (isGroupParent) {
        isGroupHover.value = true;
      }
    })
    .onTouchesUp(() => {
      if (hasInteractions) {
        isHover.value = false;
      }
      if (isGroupParent) {
        isGroupHover.value = false;
      }
    })
    .enabled(hasInteractions)
    .manualActivation(true)
    .shouldCancelWhenOutside(false);

  const interactionsHandler = useAnimatedGestureHandler<LongPressGestureHandlerGestureEvent>(
    {
      onStart: () => {
        if (hasInteractions) {
          isHover.value = true;
        }
        if (isGroupParent) {
          isGroupHover.value = true;
        }
      },
      onFinish: () => {
        if (hasInteractions) {
          isHover.value = false;
        }
        if (isGroupParent) {
          isGroupHover.value = false;
        }
      },
      onCancel: () => {
        if (hasInteractions) {
          isHover.value = false;
        }
        if (isGroupParent) {
          isParentGroupHover.value = false;
          isGroupHover.value = false;
        }
      },
    },
    [isGroupParent, isGroupHover, tailwindContext],
  );
  const hoverInteraction = interactionStyles.find(([name]) => name === 'hover');
  const groupHoverInteraction = interactionStyles.find(([name]) => name === 'group-hover');
  const styles = useAnimatedStyle(() => {
    if (!isGroupParent && groupHoverInteraction && isParentGroupHover.value) {
      return {
        ...normalStyles,
        ...groupHoverInteraction[1].styles,
      };
    }
    if (isHover.value && hoverInteraction) {
      return {
        ...normalStyles,
        ...hoverInteraction[1].styles,
      };
    }
    return normalStyles;
  }, [isHover, isParentGroupHover, isGroupHover, isGroupParent]);
  return {
    styles,
    hasInteractions,
    componentState: {
      hover: isHover,
      active: isActive,
      focus: isFocus,
      'group-hover': isGroupHover,
      dark: isDark,
    },
    interactionsHandler,
    gesture,
    hasGroupInteractions,
  };
};

export { useFinalStyles };
