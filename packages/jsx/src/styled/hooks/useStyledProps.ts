import { useEffect, useMemo } from 'react';
import { RegisteredComponent } from '@native-twin/css/jsx';
import { useAtomValue } from '@native-twin/helpers';
import { StyleSheet } from '../../sheet/StyleSheet';
import { tw } from '../../sheet/native-tw';
import { styledContext, twinConfigObservable } from '../../store/observables';
import { ComponentTemplateEntryProp } from '../../types/jsx.types';
import { INTERNAL_RESET } from '../../utils/constants';
import { templatePropsToSheetEntriesObject } from '../native/utils/native.maps';

export const useStyledProps = (
  id: string,
  compiledSheet: RegisteredComponent | null = null,
  templateEntries: ComponentTemplateEntryProp[],
  debug: boolean,
) => {
  const templateEntriesObj = templatePropsToSheetEntriesObject(templateEntries ?? []);

  const styledCtx = useAtomValue(styledContext);

  const componentStyles = useMemo(() => {
    if (compiledSheet) {
      return StyleSheet.registerComponent(
        id,
        compiledSheet.sheets.map((x) => x.compiledSheet),
        styledCtx,
      );
    }
    return StyleSheet.registerComponent(id, [], styledCtx);
  }, [compiledSheet, styledCtx, id]);

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
  return { componentStyles, styledCtx, templateEntriesObj };
};
