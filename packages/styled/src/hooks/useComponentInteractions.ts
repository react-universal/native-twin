import { useMemo, useRef } from 'react';
import type { NativeSyntheticEvent, Touchable, TextInputFocusEventData } from 'react-native';
import { setComponentInteractionState } from '@universal-labs/stylesheets';

interface UseComponentInteractionsArgs {
  props: Touchable;
  componentID: string;
  hasPointerInteractions: boolean;
  isGroupParent: boolean;
  hasGroupInteractions: boolean;
}

interface InternalTouchable extends Touchable {
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

const useComponentInteractions = ({
  props,
  hasPointerInteractions,
  isGroupParent,
  componentID,
  hasGroupInteractions,
}: UseComponentInteractionsArgs) => {
  const ref = useRef<
    Touchable & {
      onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
      onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
    }
  >(props);

  const componentInteractionHandlers = useMemo(() => {
    const handlers: Touchable = {};
    if (hasPointerInteractions || isGroupParent || hasGroupInteractions) {
      handlers.onTouchStart = function (event) {
        if (ref.current.onTouchStart) {
          ref.current.onTouchStart(event);
        }
        if (isGroupParent) {
          setComponentInteractionState(componentID, 'group-hover', true);
        }
        if (hasPointerInteractions) {
          setComponentInteractionState(componentID, 'hover', true);
        }
      };
      handlers.onTouchEnd = function (event) {
        if (ref.current.onTouchEnd) {
          ref.current.onTouchEnd(event);
        }
        if (isGroupParent) {
          setComponentInteractionState(componentID, 'group-hover', false);
        }
        if (hasPointerInteractions) {
          setComponentInteractionState(componentID, 'hover', false);
        }
      };
    }
    return handlers;
  }, [componentID, hasPointerInteractions, isGroupParent, hasGroupInteractions]);

  const focusHandlers = useMemo(() => {
    const handlers: InternalTouchable = {};
    if (hasPointerInteractions) {
      handlers.onFocus = function (event) {
        if (ref.current.onFocus) {
          ref.current.onFocus(event);
        }
        setComponentInteractionState(componentID, 'focus', true);
      };
      handlers.onBlur = function (event) {
        if (ref.current.onBlur) {
          ref.current.onBlur(event);
        }
        setComponentInteractionState(componentID, 'focus', false);
      };
    }
    return handlers;
  }, [hasPointerInteractions, componentID]);

  return {
    componentInteractionHandlers,
    focusHandlers,
  };
};

export { useComponentInteractions };
