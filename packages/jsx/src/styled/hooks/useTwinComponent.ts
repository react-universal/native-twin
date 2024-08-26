import { useCallback, useContext } from 'react';
import { ComponentSheet } from '@native-twin/css/jsx';
import { atom, useAtom, useAtomValue } from '@native-twin/helpers';
import { groupContext } from '../../context';
import { getTwinComponent } from '../../store/components.store';
import { DEFAULT_INTERACTIONS } from '../../utils/constants';

export const useTwinComponent = (
  id: string,
  styledProps: [string, ComponentSheet][] = [],
) => {
  const context = useContext(groupContext);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
