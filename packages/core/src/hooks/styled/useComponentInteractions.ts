import { useMemo, useRef } from 'react';
import type { Touchable } from 'react-native';
import type { IUseComponentState } from './useComponentState';

interface UseComponentInteractionsArgs {
  props: Touchable;
  componentState: IUseComponentState;
  isGroupParent: boolean;
}
const useComponentInteractions = ({
  props,
  componentState,
  isGroupParent,
}: UseComponentInteractionsArgs) => {
  const ref = useRef<Touchable>(props);
  const componentInteractionHandlers = useMemo(() => {
    const handlers: Touchable = {};
    if (componentState.hoverInteraction.interactionStyle) {
      handlers.onTouchStart = function (event) {
        if (ref.current.onTouchStart) {
          ref.current.onTouchStart(event);
        }
        if (isGroupParent) {
          componentState.groupHoverInteraction.setInteractionState(true);
        }
        componentState.hoverInteraction.setInteractionState(true);
      };
      handlers.onTouchEnd = function (event) {
        if (ref.current.onTouchEnd) {
          ref.current.onTouchEnd(event);
        }
        if (isGroupParent) {
          componentState.groupHoverInteraction.setInteractionState(false);
        }
        componentState.hoverInteraction.setInteractionState(false);
      };
    }
    return handlers;
  }, [componentState, isGroupParent]);
  return {
    componentInteractionHandlers,
  };
};

export { useComponentInteractions };
