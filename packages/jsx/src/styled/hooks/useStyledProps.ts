import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { tw } from '@native-twin/core';
import { atom, useAtom, useAtomValue } from '@native-twin/helpers';
import { groupContext } from '../../context';
import { StyleSheet } from '../../sheet/StyleSheet';
import { styledContext } from '../../store/observables/styles.obs';
import { twinConfigObservable } from '../../store/observables/twin.observer';
import { ComponentConfig } from '../../types/styled.types';
import { DEFAULT_INTERACTIONS, INTERNAL_RESET } from '../../utils/constants';

export const useStyledProps = (
  id: string,
  configs: ComponentConfig[],
  props: Record<string, any> | null,
) => {
  const renderCount = useRef(0);
  if (props?.['debug']) {
    console.debug('RENDER_COUNTER: ', ++renderCount.current);
  }
  const context = useContext(groupContext);
  const styledCtx = useAtomValue(styledContext);

  const componentStyles = useMemo(
    () => StyleSheet.registerComponent(id, { props, configs, context: styledCtx }),
    [props, styledCtx, context, id, configs],
  );

  const [state, setState] = useAtom(StyleSheet.getComponentState(id));

  const parentState = useAtomValue(
    atom((get) => {
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
