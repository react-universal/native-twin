import { useCallback, useMemo, useReducer } from 'react';
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

export function useComponentState(componentProps: any) {
  const [state, dispatch] = useReducer(componentStateReducer, initialState);
  const onHover = useCallback(() => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: true } });
  }, []);
  const onBlur = useCallback(() => {
    dispatch({ type: 'SetInteraction', payload: { kind: 'hover', active: false } });
  }, []);

  const parentProps = useMemo(() => {
    const nthChild = Number(componentProps?.nthChild ?? 0);
    const isParentHover = Boolean(componentProps?.parentHover);
    if (nthChild > 0) {
      console.log('IM_NTH: ', componentProps?.nthChild);
      if (isParentHover && !state.hover) {
        onHover();
      }
      if (!isParentHover && state.hover) {
        onBlur();
      }
    }
  }, [componentProps?.nthChild, onBlur, onHover, componentProps?.parentHover, state.hover]);
  console.log('PARENT_PROPS: ', parentProps);

  return {
    state,
    onHover,
    onBlur,
  };
}
