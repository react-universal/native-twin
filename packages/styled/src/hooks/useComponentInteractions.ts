import { useMemo, useRef } from 'react';
import type { NativeSyntheticEvent, Touchable, TextInputFocusEventData } from 'react-native';
import { setInteractionState } from '@universal-labs/stylesheets';
import type { TValidInteractionPseudoSelectors } from '@universal-labs/stylesheets/build/constants';

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

interface InternalTouchable extends Touchable {
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
  // const [snap, setSnap] = useState(0);
  // const forceUpdate = useCallback(() => {
  //   setSnap(snap + 1);
  // }, [snap]);
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
          setInteractionState(id, 'group-hover', true);
        }
        if (hasPointerInteractions) {
          setInteractionState(id, 'hover', true);
        }
        // if (isGroupParent || hasPointerInteractions) {
        //   forceUpdate();
        // }
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
        // if (isGroupParent || hasPointerInteractions) {
        //   forceUpdate();
        // }
      };
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
