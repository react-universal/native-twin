/* eslint-disable unused-imports/no-unused-vars */
import { useCallback, useReducer } from 'react';
import type { TPseudoSelectorTypes } from '@react-universal/core';
import type { IComponentState } from '../styled.types';

const initialState: IComponentState = {
  active: false,
  dark: false,
  focus: false,
  hover: false,
  'group-hover': false,
};

type IActionType = {
  type: 'SetInteraction';
  payload: { kind: TPseudoSelectorTypes; active: boolean };
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
        'group-hover':
          action.payload.kind === 'hover' ? action.payload.active : state['group-hover'],
      };
    default:
      return state;
  }
};

export function useComponentState(componentProps: any) {
  const [state, dispatch] = useReducer(componentStateReducer, initialState);
  const onHover = useCallback(() => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: true } });
  }, []);
  const onBlur = useCallback(() => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: false } });
  }, []);

  return {
    state,
    onHover,
    onBlur,
  };
}
