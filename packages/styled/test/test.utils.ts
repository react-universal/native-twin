import { composeDeclarations, type RuntimeTW } from '@native-twin/core';
import type { AnyStyle } from '@native-twin/css';
import { Predicates, type TwinRuntimeComponent } from '@native-twin/css/jsx';
import { TwinStyleSheet } from '../src';
import { styledJSXStore } from '../src/store/twinStore';

export const createTestRuntimeComponent = (
  id: string,
  classNames: string,
  tw: RuntimeTW,
): {
  runtimeComponent: TwinRuntimeComponent;
  styles: AnyStyle;
} => {
  const runtimeEntries = tw(classNames).map((x) => TwinStyleSheet.evaluateSheetEntry(x));
  const finalStyles = composeDeclarations(
    runtimeEntries.flatMap((x) => x.declarations),
    TwinStyleSheet.readStyledContext,
  );
  const metadata = {
    hasGroupEvents: runtimeEntries.some((x) => x.groups.some(Predicates.isGroupSelector)),
    hasPointerEvents: runtimeEntries.some((x) => x.groups.some(Predicates.isPointerSelector)),
    isGroupParent: runtimeEntries.some((x) => x.className === 'group'),
  };
  const component = {
    id,
    index: 0,
    childStyles: runtimeEntries.filter((x) => x.groups.some(Predicates.isChildSelector)),
    metadata,
    parentID: null,
    parentSize: 0,
    props: [
      {
        entries: runtimeEntries,
        metadata,
        prop: 'className',
        target: 'styles',
      },
    ],
  };
  styledJSXStore.registerComponent(component);
  return { runtimeComponent: component, styles: finalStyles };
};
