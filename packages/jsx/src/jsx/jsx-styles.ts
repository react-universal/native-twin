import { FinalSheet } from '@native-twin/css';
import { StyleSheet } from '../sheet/StyleSheet';
import { templatePropsToSheetEntriesObject } from '../styled/native/utils/native.maps';
import { JSXInternalProps } from '../types/jsx.types';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  const twinSheet = props?.['_twinComponentSheet'];
  const templateEntries = props?.['_twinComponentTemplateEntries'];
  if (templateEntries && templateEntries.length > 0) {
    if (twinSheet) {
      const sheet = templatePropsToSheetEntriesObject(templateEntries ?? []);
      for (const [prop, entries] of Object.entries(sheet)) {
        const styles = StyleSheet.entriesToFinalSheet(entries);
        twinSheet.sheets = twinSheet.sheets.map((x) => {
          if (x.prop === prop) {
            return {
              ...x,
              sheet: mergeSheets(x.sheet, styles),
              metadata: {
                isGroupParent: entries.some((x) => x.className == 'group'),
                hasGroupEvents: Object.keys(x.sheet.group)?.length > 0,
                hasPointerEvents: Object.keys(x.sheet.pointer)?.length > 0,
                hasAnimations: entries.some((x) => x.animations.length > 0),
              },
            };
          }
          return x;
        });
      }
      twinSheet.metadata = {
        hasAnimations:
          twinSheet.metadata.hasAnimations ||
          twinSheet.sheets.some((x) => x.metadata.hasAnimations),
        hasGroupEvents:
          twinSheet.metadata.hasGroupEvents ||
          twinSheet.sheets.some((x) => x.metadata.hasGroupEvents),
        hasPointerEvents:
          twinSheet.metadata.hasPointerEvents ||
          twinSheet.sheets.some((x) => x.metadata.hasPointerEvents),
        isGroupParent:
          twinSheet.metadata.isGroupParent ||
          twinSheet.sheets.some((x) => x.metadata.isGroupParent),
      };
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
