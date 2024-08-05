import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import 'react-native';
import { RegisteredComponent, RuntimeComponentEntry } from '@native-twin/css/jsx';
import { atom, useAtom, useAtomValue } from '@native-twin/helpers';
import { groupContext } from '../../context';
import { StyleSheet } from '../../sheet/StyleSheet';
import { tw } from '../../sheet/native-tw';
import { styledContext, twinConfigObservable } from '../../store/observables';
import { ComponentTemplateEntryProp } from '../../types/jsx.types';
import { DEFAULT_INTERACTIONS, INTERNAL_RESET } from '../../utils/constants';
import { templatePropsToSheetEntriesObject } from '../native/utils/native.maps';

export const useStyledProps = (
  id: string,
  styledEntries: RuntimeComponentEntry[],
  compiledSheet: RegisteredComponent | null = null,
  templateEntries: ComponentTemplateEntryProp[],
  debug: boolean,
) => {
  const templateEntriesObj = templatePropsToSheetEntriesObject(templateEntries ?? []);
  const renderCount = useRef(0);
  if (debug) {
    console.debug('RENDER_COUNTER: ', id, ++renderCount.current);
  }
  const context = useContext(groupContext);
  const styledCtx = useAtomValue(styledContext);

  const componentStyles = useMemo(() => {
    return StyleSheet.registerComponent(id, styledEntries, styledCtx);
  }, [compiledSheet, styledEntries, styledCtx, id]);

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
    [id, componentStyles],
  );

  useEffect(() => {
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
  return { state, onChange, parentState, componentStyles, styledCtx, templateEntriesObj };
};
