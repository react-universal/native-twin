import { useReducer } from 'react';
import type { TPseudoSelectorTypes } from '../types/store.types';

export type IComponentState = Record<TPseudoSelectorTypes, boolean>;
const initialState: IComponentState = {
  active: false,
  dark: false,
  focus: false,
  hover: false,
};
type IActionType = {
  type: 'SetInteraction';
  payload: { kind: TPseudoSelectorTypes; active: boolean };
};

const componentStateReducer = (state: IComponentState, action: IActionType) => {
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

export function useComponentState() {
  const [state, dispatch] = useReducer(componentStateReducer, initialState);
  const onHover = () => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: true } });
  };
  const onBlur = () => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: false } });
  };

  return {
    state,
    onHover,
    onBlur,
  };
}
