import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { atom, useAtom, useAtomValue } from '@native-twin/helpers';
import { groupContext } from '../../context';
import { StyleSheet } from '../../sheet/StyleSheet';
import { tw } from '../../sheet/native-tw';
import { styledContext, twinConfigObservable } from '../../store/observables';
import { BabelStyledProps } from '../../types/jsx.types';
import { DEFAULT_INTERACTIONS, INTERNAL_RESET } from '../../utils/constants';

export const useStyledProps = (
  id: string,
  styledProps: BabelStyledProps[],
  debug: boolean,
) => {
  const renderCount = useRef(0);
  if (debug) {
    console.debug('RENDER_COUNTER: ', id, ++renderCount.current);
  }
  const context = useContext(groupContext);
  const styledCtx = useAtomValue(styledContext);

  const componentStyles = useMemo(() => {
    return StyleSheet.registerComponent(id, styledProps ?? [], styledCtx);
  }, [styledProps, styledCtx, id]);

  const [state, setState] = useAtom(StyleSheet.getComponentState(id));

  const parentState = useAtomValue(
    atom((get) => {
      // console.log('PARENT_STATE');
      if (!context || !componentStyles.metadata.hasGroupEvents) {
        return DEFAULT_INTERACTIONS;
      }
      return get(StyleSheet.getComponentState(context));
    }),
  );

  const onChange = useCallback(
    (active: boolean) => {
      if (
        componentStyles.metadata.hasPointerEvents ||
        componentStyles.metadata.isGroupParent
      ) {
        setState({
          isLocalActive: active,
          isGroupActive: active,
        });
      }
    },
    [id],
  );

  useEffect(() => {
    // remObs.set(tw.config?.root?.rem ?? 16);
    if (StyleSheet.getFlag('STARTED') === 'NO') {
      StyleSheet[INTERNAL_RESET](tw.config);
    }
    const obs = tw.observeConfig((c) => {
      if (twinConfigObservable.get() !== c) {
        StyleSheet[INTERNAL_RESET](c);
      }
    });
    return () => obs();
  }, []);
  return { state, onChange, parentState, componentStyles };
};
