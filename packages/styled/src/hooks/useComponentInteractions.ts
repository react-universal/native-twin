import { useMemo, useRef } from 'react';
import type { Touchable } from 'react-native';
import { ComponentNode, setComponentInteractionState } from '@universal-labs/stylesheets';

interface UseComponentInteractionsArgs {
  props: Touchable;
  component: ComponentNode;
}
const useComponentInteractions = ({ props, component }: UseComponentInteractionsArgs) => {
  const ref = useRef<Touchable>(props);
  const componentInteractionHandlers = useMemo(() => {
    const handlers: Touchable = {};
    if (
      component &&
      (component.hasPointerInteractions ||
        component.isGroupParent ||
        component.hasGroupInteractions)
    ) {
      handlers.onTouchStart = function (event) {
        if (ref.current.onTouchStart) {
          ref.current.onTouchStart(event);
        }
        if (component.isGroupParent) {
          setComponentInteractionState(component, 'group-hover', true);
        }
        if (component.hasPointerInteractions) {
          setComponentInteractionState(component, 'hover', true);
        }
      };
      handlers.onTouchEnd = function (event) {
        if (ref.current.onTouchEnd) {
          ref.current.onTouchEnd(event);
        }
        if (component.isGroupParent) {
          setComponentInteractionState(component, 'group-hover', false);
        }
        if (component.hasPointerInteractions) {
          setComponentInteractionState(component, 'hover', false);
        }
      };
    }
    return handlers;
  }, [component]);
  return {
    componentInteractionHandlers,
  };
};

export { useComponentInteractions };
