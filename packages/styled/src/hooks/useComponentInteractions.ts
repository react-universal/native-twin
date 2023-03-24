import { useMemo, useRef } from 'react';
import type { Touchable } from 'react-native';
import { setComponentInteractionState } from '@universal-labs/stylesheets';

interface UseComponentInteractionsArgs {
  props: Touchable;
  component: {
    id: string;
    hasPointerInteractions: boolean;
    isGroupParent: boolean;
    hasGroupInteractions: boolean;
  };
}
const useComponentInteractions = ({
  props,
  component: { hasGroupInteractions, hasPointerInteractions, isGroupParent, id },
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
          setComponentInteractionState(id, 'group-hover', true);
        }
        if (hasPointerInteractions) {
          setComponentInteractionState(id, 'hover', true);
        }
      };
      handlers.onTouchEnd = function (event) {
        if (ref.current.onTouchEnd) {
          ref.current.onTouchEnd(event);
        }
        if (isGroupParent) {
          setComponentInteractionState(id, 'group-hover', false);
        }
        if (hasPointerInteractions) {
          setComponentInteractionState(id, 'hover', false);
        }
      };
    }
    return handlers;
  }, [hasGroupInteractions, isGroupParent, hasPointerInteractions, id]);
  return {
    componentInteractionHandlers,
  };
};

export { useComponentInteractions };
