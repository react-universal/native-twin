import { useMemo, useRef } from 'react';
import type { Touchable } from 'react-native';
import { setComponentInteractionState } from '@universal-labs/stylesheets';

interface UseComponentInteractionsArgs {
  props: Touchable;
  componentID: string;
  hasPointerInteractions: boolean;
  isGroupParent: boolean;
  hasGroupInteractions: boolean;
}
const useComponentInteractions = ({
  props,
  hasPointerInteractions,
  isGroupParent,
  componentID,
  hasGroupInteractions,
}: UseComponentInteractionsArgs) => {
  const ref = useRef<Touchable>(props);
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
  return {
    componentInteractionHandlers,
  };
};

export { useComponentInteractions };
