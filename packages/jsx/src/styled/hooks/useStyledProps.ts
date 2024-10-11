import { useEffect, useMemo } from 'react';
import { cx } from '@native-twin/core';
import {
  getGroupedEntries,
  RegisteredComponent,
  RuntimeComponentEntry,
  RuntimeSheetDeclaration,
  RuntimeSheetEntry,
} from '@native-twin/css/jsx';
import { asArray } from '@native-twin/helpers';
import { useAtomValue } from '@native-twin/helpers/react';
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
      const classNames = compiledSheet.sheets
        .flatMap((x) => x.compiledSheet.entries.map((x) => x.className))
        .map((x) => cx`${x}`)
        .join('-');
      const propClasses = configs
        .map((x): string | undefined => props[x.source])
        .filter((x) => typeof x !== 'undefined')
        .map((x) => cx`${x}`)
        .join('-');
      if (classNames === propClasses) {
        return StyleSheet.registerComponent(
          id,
          compiledSheet.sheets.map((x) => x.compiledSheet),
          styledCtx,
        );
      }
    }
    const entries = configs.flatMap((config): RuntimeComponentEntry[] => {
      const source = props[config.source];

      if (!source) {
        return [];
      }
      const compiledEntries = tw(`${source}`).map((entry): RuntimeSheetEntry => {
        return {
          animations: [],
          className: entry.className,
          preflight: false,
          declarations: entry.declarations.map(
            (decl): RuntimeSheetDeclaration => ({
              _tag: 'NOT_COMPILED',
              prop: decl.prop,
              value: composeDeclarations([decl], styledCtx),
            }),
          ),
          important: entry.important,
          precedence: entry.precedence,
          selectors: entry.selectors,
        };
      });
      return asArray({
        classNames: source,
        entries: compiledEntries,
        prop: config.source,
        rawSheet: getGroupedEntries(compiledEntries),
        target: config.target,
        templateLiteral: null,
      });
    });

    const component = StyleSheet.registerComponent(id, entries, styledCtx, false);
    return component;
  }, [styledCtx, id, configs, props, compiledSheet]);

  useEffect(() => {
    if (StyleSheet.getFlag('STARTED') === 'NO') {
      if (tw.config) {
        StyleSheet[INTERNAL_RESET](tw.config);
      }
      const obs = tw.observeConfig((c) => {
        console.log('SSSS_CHANGE: ', c);
        if (!c?.root) return;
        StyleSheet[INTERNAL_RESET](c);
      });
      return () => obs();
    }
    return () => {};
  }, []);

  return { componentStyles, styledCtx, templateEntriesObj };
};
