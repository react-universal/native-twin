import { FinalSheet } from '@native-twin/css';
import { componentsRegistry, StyleSheet } from '../sheet/StyleSheet';
import { templatePropsToSheetEntriesObject } from '../styled/native/utils/native.maps';
import { JSXInternalProps } from '../types/jsx.types';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  props?.['_twinComponentSheet'];
  const templateEntries = props?.['_twinComponentTemplateEntries'];
  const componentID = props?.['_twinComponentID'];
  if (componentID) {
    const component = StyleSheet.getComponentByID(componentID);

    if (component) {
      const templateSheet = templatePropsToSheetEntriesObject(templateEntries ?? []);
      for (const [prop, entries] of Object.entries(templateSheet)) {
        const styles = StyleSheet.entriesToFinalSheet(entries);
        component.sheets = component.sheets.map((x) => {
          if (x.prop === prop) {
            const newSheet = mergeSheets(x.sheet, styles);
            return {
              ...x,
              sheet: newSheet,
              metadata: {
                isGroupParent: entries.some((x) => x.className == 'group'),
                hasGroupEvents: Object.keys(newSheet.group)?.length > 0,
                hasPointerEvents: Object.keys(newSheet.pointer)?.length > 0,
                hasAnimations: entries.some((x) => x.animations.length > 0),
              },
            };
          }
          return x;
        });
      }

      // component.metadata = {
      //   ...component.metadata,
      //   isGroupParent: component.sheets.some((x) => x.metadata.isGroupParent),
      //   hasGroupEvents: component.sheets.some((x) => x.metadata.hasGroupEvents),
      //   hasPointerEvents: component.sheets.some((x) => x.metadata.hasPointerEvents),
      //   hasAnimations: component.sheets.some((x) => x.metadata.hasAnimations),
      // };

      // component.sheets = component.sheets.map((x) => x.recompute());
      componentsRegistry.set(componentID, {
        ...component,
        sheets: [...component.sheets],
      });
    }
  }
}

const mergeSheets = (a: FinalSheet, b: FinalSheet): FinalSheet => {
  return {
    base: { ...a.base, ...b.base },
    dark: { ...a.dark, ...b.dark },
    group: { ...a.group, ...b.group },
    pointer: { ...a.pointer, ...b.pointer },
    first: { ...a.first, ...b.first },
    last: { ...a.last, ...b.last },
    even: { ...a.even, ...b.even },
    odd: { ...a.odd, ...b.odd },
  };
};
