import { getRuleSelectorGroup } from '@native-twin/css';
import { Platform } from 'react-native';
import {
  compileSheetEntry,
  sortSheetEntriesByPrecedence,
  type RuntimeGroupSheet,
  type RuntimeSheetEntry,
  type SheetEntry,
} from '@native-twin/css/jsx';
import { remObs } from '../../../store/observables';
import type { ComponentTemplateEntryProp } from '../../../types/jsx.types';

export const composeTemplateSheets = (entries: SheetEntry[]): RuntimeGroupSheet => {
  return entries
    .map((x) =>
      compileSheetEntry(x, {
        baseRem: remObs.get(),
        platform: Platform.OS,
      }),
    )
    .reduce(
      (prev, current) => {
        const group = getRuleSelectorGroup(current.selectors);
        prev[group].push(current);
        // console.log('BEFORE: ', prev[group].map((x) => x.className).join(', '));
        prev[group].sort(sortSheetEntriesByPrecedence);
        // console.log('AFTER: ', prev[group].map((x) => x.className).join(', '));

        return prev;
      },
      {
        base: [],
        group: [],
        pointer: [],
        first: [],
        last: [],
        odd: [],
        even: [],
        dark: [],
      } as RuntimeGroupSheet,
    );
};

export const templatePropsToSheetEntriesObject = (
  templates: ComponentTemplateEntryProp[],
) => {
  return templates.reduce(
    (prev, current) => {
      if (prev[current.target]) {
        prev[current.target]?.push(...current.entries);
      }
      if (!prev[current.target]) {
        prev[current.target] = current.entries;
      }
      return prev;
    },
    {} as Record<string, RuntimeSheetEntry[]>,
  );
};
