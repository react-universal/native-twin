import { atom, useAtom, useAtomValue } from '@native-twin/helpers/react';
import { useCallback, useContext } from 'react';
import { GroupContext } from '../../context';
import { getTwinComponent } from '../../store/components.store';
import { DEFAULT_INTERACTIONS } from '../../utils/constants';

export const useTwinComponent = (id: string) => {
  const context = useContext(GroupContext);

  const [state, setState] = useAtom(getTwinComponent(id as any));

  const parentState = useAtomValue(
    atom((get) => {
      if (!context || !state.meta.hasGroupEvents) {
        return DEFAULT_INTERACTIONS;
      }
      return get(getTwinComponent(context as any)).interactions;
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
    [state, setState],
  );

  return {
    state,
    id,
    onChange,
    parentState,
  };
};
