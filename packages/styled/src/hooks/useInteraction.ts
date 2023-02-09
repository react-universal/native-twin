import { useMemo, useRef } from 'react';
import {
  GestureResponderEvent,
  NativeSyntheticEvent,
  TargetedEvent,
  MouseEvent,
  PanResponder,
} from 'react-native';
import { useStore } from '@react-universal/core';
import type { InteractionProps } from '../styled.types';

// declare module 'react-native' {
//   interface PressableProps {
//     onHoverIn?: ((event: MouseEvent) => void) | null;
//     onHoverOut?: ((event: MouseEvent) => void) | null;
//   }
// }

export function useInteraction(componentID: string, componentProps: Record<string, any>) {
  const ref = useRef<InteractionProps>(componentProps);
  ref.current = componentProps;
  const component = useStore(
    (state) => state.components.registeredComponents.get(componentID)!,
  );
  const setComponentInteractions = useStore(
    (state) => state.components.setComponentInteractions,
  );

  const active = component?.interactionStyles?.active.classNames.length > 0;
  const focus = component?.interactionStyles?.focus.classNames.length > 0;
  const hover = component?.interactionStyles?.hover.classNames.length > 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder(event) {
        event.persist();
        // console.log('onStartShouldSetPanResponder: ', { event, state });
        return true;
      },
      onPanResponderGrant(event) {
        event.persist();
        setComponentInteractions(componentID, { kind: 'hover', active: true });
        // console.log('onPanResponderGrant: ', { event, state });
      },
      onPanResponderRelease() {
        setComponentInteractions(componentID, { kind: 'hover', active: false });
        // console.log('onPanResponderRelease: ', { event, state });
        // event.stopPropagation();
      },
    }),
  ).current;

  return useMemo(() => {
    const handlers: InteractionProps = {};

    if (active) {
      handlers.onPressIn = (event: GestureResponderEvent) => {
        if (ref.current.onPressIn) {
          ref.current.onPressIn(event);
        }
        console.log('ON_PRESS_IN');
      };

      handlers.onPressOut = (event: GestureResponderEvent) => {
        if (ref.current.onPressOut) {
          ref.current.onPressOut(event);
        }
        console.log('ON_PRESS_OUT');
      };
    }

    if (hover) {
      handlers.onHoverIn = (event: MouseEvent) => {
        if (ref.current.onHoverIn) {
          ref.current.onHoverIn(event);
        }
        console.log('ON_HOVER_IN');
      };

      handlers.onHoverOut = (event: MouseEvent) => {
        if (ref.current.onHoverIn) {
          ref.current.onHoverIn(event);
        }
        console.log('ON_HOVER_OUT');
      };
    }

    if (focus) {
      handlers.onFocus = (event: NativeSyntheticEvent<TargetedEvent>) => {
        if (ref.current.onFocus) {
          ref.current.onFocus(event);
        }
        console.log('ON_FOCUS_IN');
      };

      handlers.onBlur = (event: NativeSyntheticEvent<TargetedEvent>) => {
        if (ref.current.onBlur) {
          ref.current.onBlur(event);
        }
        console.log('ON_FOCUS_OUT');
      };
    }

    return { ...handlers, ...panResponder.panHandlers };
  }, [active, hover, focus, panResponder]);
}
