import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { SelectorGroup } from '../css/css.types';
import { getRuleSelectorGroup } from '../tailwind/tailwind.utils';
import { RuntimeComponentEntry } from './Component';
import { RuntimeSheetEntry, sortSheetEntries } from './SheetEntry';
import { defaultSheetMetadata, emptyChildsSheet } from './constants';

/** @category MetroBundler */
export type ChildsSheet = Pick<RuntimeGroupSheet, 'first' | 'last' | 'even' | 'odd'>;

/** @category MetroBundler */
export interface JSXElementSheet {
  propEntries: RuntimeComponentEntry[];
  childEntries: ChildsSheet;
}

export type RuntimeGroupSheet = Record<SelectorGroup, RuntimeSheetEntry[]>;

export const groupEntriesBySelectorGroup = (
  x: RuntimeSheetEntry[],
): Record<SelectorGroup, RuntimeSheetEntry[]> =>
  RA.groupBy(x, (entry) => getRuleSelectorGroup(entry.selectors));

export const getChildRuntimeEntries = (
  runtimeEntries: RuntimeComponentEntry[],
): ChildsSheet => {
  return pipe(
    runtimeEntries,
    RA.map((runtimeEntry) => runtimeEntry.rawSheet),
    RA.reduce(emptyChildsSheet, (prev, current) => {
      prev.first.push(...current.first);
      prev.last.push(...current.last);
      prev.even.push(...current.even);
      prev.odd.push(...current.odd);
      return prev;
    }),
  );
};

export const getGroupedEntries = (runtime: RuntimeSheetEntry[]): RuntimeGroupSheet => {
  return pipe(runtime, sortSheetEntries, groupEntriesBySelectorGroup, (entry) => {
    return {
      base: entry.base ?? [],
      dark: entry.dark ?? [],
      pointer: entry.pointer ?? [],
      group: entry.group ?? [],
      even: entry.even ?? [],
      first: entry.first ?? [],
      last: entry.last ?? [],
      odd: entry.odd ?? [],
    };
  });
};

/** @category Filters */
export const applyParentEntries = (
  currentEntries: RuntimeComponentEntry[],
  parentEntries: ChildsSheet,
  order: number,
  parentChildsNumber: number,
): RuntimeComponentEntry[] => {
  return pipe(
    currentEntries,
    RA.map((entry): RuntimeComponentEntry => {
      const newSheet = entry.rawSheet;
      if (order === 0) newSheet.base.push(...parentEntries.first);
      if (order === parentChildsNumber - 1) newSheet.base.push(...parentEntries.last);
      if (order % 2 === 0) newSheet.base.push(...parentEntries.even);
      if (order % 2 !== 0) newSheet.base.push(...parentEntries.odd);
      return {
        ...entry,
        rawSheet: newSheet,
      };
    }),
  );
};

/** @category Filters */
export function getSheetMetadata(
  entries: RuntimeSheetEntry[],
): RuntimeComponentEntry['metadata'] {
  return pipe(
    entries,
    RA.reduce(defaultSheetMetadata, (prev, current) => {
      const group = getRuleSelectorGroup(current.selectors);
      if (!prev.isGroupParent && current.className === 'group') {
        prev.isGroupParent = true;
      }
      if (!prev.hasPointerEvents && group === 'pointer') {
        prev.hasPointerEvents = true;
      }
      if (!prev.hasGroupEvents && group === 'group') {
        prev.hasGroupEvents = true;
      }
      return prev;
    }),
  );
}
