import { useCallback, useContext, useId } from 'react';
import { atom, useAtom, useAtomValue } from '@native-twin/helpers';
import { groupContext } from '../../context';
import { ComponentSheet } from '../../sheet/StyleSheet';
import { getTwinComponent } from '../../store/components.store';
import { DEFAULT_INTERACTIONS } from '../../utils/constants';

export const useTwinComponent = (styledProps: [string, ComponentSheet][] = []) => {
  const id = useId();
  const context = useContext(groupContext);
  // console.log('RENDER_COUNTER: ', ++useRef(0).current);

  const [state, setState] = useAtom(getTwinComponent(id, styledProps));

  const parentState = useAtomValue(
    atom((get) => {
      if (!context || !state.meta.hasGroupEvents) {
        return DEFAULT_INTERACTIONS;
      }
      return get(getTwinComponent(context)).interactions;
    }),
  );

  const onChange = useCallback(
    (active: boolean) => {
      if (state.meta.hasPointerEvents || state.meta.isGroupParent) {
        state.interactions = {
          isLocalActive: active,
          isGroupActive: active,
        };
        setState({ ...state });
      }
    },
    [id],
  );

  // console.log('Render_Count', ++useRef(0).current);

  return {
    state,
    id,
    onChange,
    parentState,
  };
};
