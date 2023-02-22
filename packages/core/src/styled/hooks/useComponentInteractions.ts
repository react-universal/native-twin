import { useCallback, useMemo, useReducer } from 'react';
import { PanResponder } from 'react-native';
import type { IComponentInteractions, TPseudoSelectorTypes } from '../../types/store.types';
import type { IComponentState } from '../../types/styles.types';

const initialState: IComponentState = {
  active: false,
  dark: false,
  focus: false,
  hover: false,
  'group-hover': false,
};

const componentStateReducer = (
  state: IComponentState,
  action: IActionType,
): IComponentState => {
  switch (action.type) {
    case 'SetInteraction':
      return {
        ...state,
        [action.payload.kind]: action.payload.active,
      };
    default:
      return state;
  }
};

type IActionType = {
  type: 'SetInteraction';
  payload: { kind: TPseudoSelectorTypes; active: boolean };
};

interface IComponentInteractionsData {
  interactionStyles: IComponentInteractions[];
}
const useComponentInteractions = ({ interactionStyles }: IComponentInteractionsData) => {
  const [componentState, dispatch] = useReducer(componentStateReducer, initialState);
  const onHover = useCallback(() => {
    let interactionKind: TPseudoSelectorTypes = 'hover';
    dispatch({ type: 'SetInteraction', payload: { kind: interactionKind, active: true } });
  }, []);
  const onBlur = useCallback(() => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: false } });
  }, []);

  const hasInteractions = useMemo(() => interactionStyles.length > 0, [interactionStyles]);

  const panResponder = useMemo(() => {
    if (!hasInteractions) {
      return { panHandlers: {} };
    }
    return PanResponder.create({
      onStartShouldSetPanResponder(event, gestureState) {
        return hasInteractions && gestureState.numberActiveTouches === 1;
      },
      onPanResponderGrant(event, gestureState) {
        if (gestureState.numberActiveTouches === 1) {
          onHover();
        }
      },
      onPanResponderEnd() {
        onBlur();
      },
    });
  }, [hasInteractions, onBlur, onHover]);
  return {
    componentState: {
      ...componentState,
    },
    hasInteractions,
    panHandlers: panResponder.panHandlers,
    interactions: {
      onBlur,
      onHover,
    },
  };
};

export { useComponentInteractions };
