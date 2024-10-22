import { Platform } from 'react-native';
import { compileSheetEntry, getGroupedEntries } from '@native-twin/css/jsx';
import { componentsRegistry, StyleSheet } from '../sheet/StyleSheet';
import { remObs, styledContext } from '../store/observables';
import { JSXInternalProps } from '../types/jsx.types';

export function jsxStyles(props: JSXInternalProps | null | undefined, type: any) {
  // const templateEntries = props?.['_twinComponentTemplateEntries'];
  const componentSheet = props?.['_twinComponentSheet'];
  const componentID = props?.['_twinComponentID'];
  if (componentID && componentSheet) {
    let finalEntries = componentSheet;
    if (
      finalEntries.some(
        (x) => Array.isArray(x.templateEntries) && x.templateEntries.length > 0,
      )
    ) {
      finalEntries = componentSheet.map((componentEntry) => {
        if (componentEntry.templateEntries) {
          const compiledTemplates = componentEntry.templateEntries.map((y) =>
            compileSheetEntry(y, {
              baseRem: remObs.get(),
              platform: Platform.OS,
            }),
          );

          const finalEntries = [...componentEntry.entries, ...compiledTemplates];
          return {
            ...componentEntry,
            entries: finalEntries,
            rawSheet: getGroupedEntries(finalEntries),
          };
        }

        return componentEntry;
      });
      // console.log('BEFORE: ', props['_twinComponentSheet'].map(x => x.entries));

      props['_twinComponentSheet'] = finalEntries;
    }
    // console.log('AFTER: ', props['_twinComponentSheet'].map(x => x.entries));

    const component = StyleSheet.registerComponent(
      componentID,
      props['_twinComponentSheet'],
      styledContext.get(),
    );

    if (component) {
      // for (const entry of componentSheet) {
      //   // composeTemplateSheets(entry.templateEntries);
      //   if (!entry.templateEntries) continue;
      //   const styles = StyleSheet.entriesToFinalSheet(
      //     entry.templateEntries.map((x) =>
      //       compileSheetEntry(x, {
      //         baseRem: remObs.get(),
      //         platform: Platform.OS,
      //       }),
      //     ),
      //   );
      //   component.sheets = component.sheets.map((x) => {
      //     if (x.prop === entry.prop) {
      //       const newSheet = mergeSheets(x.sheet, styles);
      //       return {
      //         ...x,
      //         sheet: newSheet,
      //         metadata: {
      //           isGroupParent: entry.entries.some((x) => x.className === 'group'),
      //           hasGroupEvents: Object.keys(newSheet.group)?.length > 0,
      //           hasPointerEvents: Object.keys(newSheet.pointer)?.length > 0,
      //           hasAnimations: entry.entries.some((x) => x.animations.length > 0),
      //         },
      //       };
      //     }
      //     return x;
      //   });
      // }
      // component.metadata = {
      //   ...component.metadata,
      //   isGroupParent: component.sheets.some((x) => x.metadata.isGroupParent),
      //   hasGroupEvents: component.sheets.some((x) => x.metadata.hasGroupEvents),
      //   hasPointerEvents: component.sheets.some((x) => x.metadata.hasPointerEvents),
      //   hasAnimations: component.sheets.some((x) => x.metadata.hasAnimations),
      // };
      // component.sheets = component.sheets.map((x) => x.recompute(x.compiledSheet));
      componentsRegistry.set(componentID, {
        ...component,
        sheets: [...component.sheets],
      });
    }
  }
}

// const mergeSheets = (a: FinalSheet, b: FinalSheet): FinalSheet => {
//   return {
//     base: { ...a.base, ...b.base },
//     dark: { ...a.dark, ...b.dark },
//     group: { ...a.group, ...b.group },
//     pointer: { ...a.pointer, ...b.pointer },
//     first: { ...a.first, ...b.first },
//     last: { ...a.last, ...b.last },
//     even: { ...a.even, ...b.even },
//     odd: { ...a.odd, ...b.odd },
//   };
// };
