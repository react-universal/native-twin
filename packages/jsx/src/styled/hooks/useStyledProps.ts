import { useEffect, useMemo } from 'react';
import {
  getGroupedEntries,
  RegisteredComponent,
  RuntimeComponentEntry,
  RuntimeSheetDeclaration,
  RuntimeSheetEntry,
} from '@native-twin/css/jsx';
import { useAtomValue } from '@native-twin/helpers';
import { StyleSheet } from '../../sheet/StyleSheet';
import { tw } from '../../sheet/native-tw';
import { styledContext, twinConfigObservable } from '../../store/observables';
import { ComponentTemplateEntryProp } from '../../types/jsx.types';
import { ComponentConfig } from '../../types/styled.types';
import { INTERNAL_RESET } from '../../utils/constants';
import { composeDeclarations } from '../../utils/sheet.utils';
import { templatePropsToSheetEntriesObject } from '../native/utils/native.maps';

export const useStyledProps = (
  id: string,
  props: Record<string, any>,
  configs: ComponentConfig[],
) => {
  const compiledSheet: RegisteredComponent | null =
    props?.['_twinComponentSheet'] ?? null;

  const templateEntries: ComponentTemplateEntryProp[] = props?.[
    '_twinComponentTemplateEntries'
  ] as ComponentTemplateEntryProp[];
  // const _debug: boolean = props?.['debug'] ?? false;

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
    const entries = configs.map((config): RuntimeComponentEntry => {
      const source = props[config.source];
      const entries = tw(source ?? '').map(
        (entry): RuntimeSheetEntry => ({
          animations: [],
          className: entry.className,
          preflight: false,
          declarations: entry.declarations.map(
            (decl): RuntimeSheetDeclaration => ({
              _tag: 'NOT_COMPILED',
              prop: config.target,
              value: composeDeclarations([decl], styledCtx),
            }),
          ),
          important: entry.important,
          precedence: entry.precedence,
          selectors: entry.selectors,
        }),
      );
      return {
        classNames: props?.[source] ?? '',
        entries,
        prop: config.target,
        rawSheet: getGroupedEntries(entries),
        target: config.target,
        templateLiteral: null,
      };
    });
    return StyleSheet.registerComponent(id, entries, styledCtx);
  }, [compiledSheet, styledCtx, id, configs, props]);

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
