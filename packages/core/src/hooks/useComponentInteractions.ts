import { useMemo, useRef } from 'react';
import type { Touchable } from 'react-native';
import type ComponentNode from '../store/ComponentNode';
import storeManager from '../store/StoreManager';

interface UseComponentInteractionsArgs {
  props: Touchable;
  component: ComponentNode;
}
const useComponentInteractions = ({ props, component }: UseComponentInteractionsArgs) => {
  const ref = useRef<Touchable>(props);
  const componentInteractionHandlers = useMemo(() => {
    const handlers: Touchable = {};
    const setInteractionState = storeManager.getState().setInteractionState;
    if (
      component &&
      setInteractionState &&
      (component.hasPointerInteractions ||
        component.isGroupParent ||
        component.hasGroupInteractions)
    ) {
      handlers.onTouchStart = function (event) {
        if (ref.current.onTouchStart) {
          ref.current.onTouchStart(event);
        }
        if (component.isGroupParent) {
          setInteractionState(component, 'group-hover', true);
        }
        if (component.hasPointerInteractions) {
          setInteractionState(component, 'hover', true);
        }
      };
      handlers.onTouchEnd = function (event) {
        if (ref.current.onTouchEnd) {
          ref.current.onTouchEnd(event);
        }
        if (component.isGroupParent) {
          setInteractionState(component, 'group-hover', false);
        }
        if (component.hasPointerInteractions) {
          setInteractionState(component, 'hover', false);
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
