import { useMemo, useRef } from 'react';
import type {
  NativeSyntheticEvent,
  Touchable,
  TextInputFocusEventData,
  PressableProps,
} from 'react-native';
import {
  setInteractionState,
  TValidInteractionPseudoSelectors,
} from '@universal-labs/stylesheets';

interface UseComponentInteractionsArgs {
  props: Touchable;
  hasPointerInteractions: boolean;
  isGroupParent: boolean;
  hasGroupInteractions: boolean;
  id: string;
  setComponentInteractionState?(
    interaction: TValidInteractionPseudoSelectors,
    value: boolean,
  ): boolean;
}

export interface InternalTouchable extends Touchable {
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

const useComponentInteractions = ({
  props,
  hasPointerInteractions,
  isGroupParent,
  hasGroupInteractions,
  id,
}: UseComponentInteractionsArgs) => {
  const ref = useRef<
    Touchable &
      PressableProps & {
        onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
        onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
      }
  >(props);

  const componentInteractionHandlers = useMemo(() => {
    const handlers: Touchable & PressableProps = {};
    if (hasPointerInteractions || isGroupParent || hasGroupInteractions) {
      if (ref.current.onPress) {
        handlers.onPress = function (event) {
          if (ref.current.onPress) {
            ref.current.onPress(event);
          }
          if (hasPointerInteractions) {
            setInteractionState(id, 'hover', true);
          }
          if (isGroupParent) {
            setInteractionState(id, 'group-hover', true);
          }
        };

        handlers.onPressOut = function (event) {
          if (ref.current.onPressOut) {
            ref.current.onPressOut(event);
          }
          if (isGroupParent) {
            setInteractionState(id, 'group-hover', false);
          }
          if (hasPointerInteractions) {
            setInteractionState(id, 'hover', false);
          }
        };
      } else {
        handlers.onTouchStart = function (event) {
          if (ref.current.onTouchStart) {
            ref.current.onTouchStart(event);
          }
          if (hasPointerInteractions) {
            setInteractionState(id, 'hover', true);
          }
          if (isGroupParent) {
            setInteractionState(id, 'group-hover', true);
          }
        };

        handlers.onTouchEnd = function (event) {
          if (ref.current.onTouchEnd) {
            ref.current.onTouchEnd(event);
          }
          if (isGroupParent) {
            setInteractionState(id, 'group-hover', false);
          }
          if (hasPointerInteractions) {
            setInteractionState(id, 'hover', false);
          }
        };
      }
    }
    return handlers;
  }, [id, isGroupParent, hasGroupInteractions, hasPointerInteractions]);

  const focusHandlers = useMemo(() => {
    const handlers: InternalTouchable = {};
    if (hasPointerInteractions) {
      handlers.onFocus = function (event) {
        if (ref.current.onFocus) {
          ref.current.onFocus(event);
        }
        setInteractionState(id, 'focus', true);
      };
      handlers.onBlur = function (event) {
        if (ref.current.onBlur) {
          ref.current.onBlur(event);
        }
        setInteractionState(id, 'focus', false);
      };
    }
    return handlers;
  }, [hasPointerInteractions, id]);

  return {
    componentInteractionHandlers,
    focusHandlers,
  };
};

export { useComponentInteractions };
