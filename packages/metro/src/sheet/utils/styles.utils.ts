import { Order } from 'effect';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import { getRuleSelectorGroup, type SheetEntry } from '@native-twin/css';
import type {
  RuntimeComponentEntry,
  SheetGroupEntries,
  StyledPropEntries,
} from '../sheet.types';

export function getEntryGroups(
  classProps: StyledPropEntries,
): RuntimeComponentEntry['metadata'] {
  return classProps.entries
    .map((x) => [x.className, ...x.selectors])
    .reduce(
      (prev, current): RuntimeComponentEntry['metadata'] => {
        const selector = getRuleSelectorGroup(current);
        if (current.includes('group')) {
          prev.isGroupParent = true;
        }
        if (selector === 'group') {
          prev.hasGroupEvents = true;
        }
        if (selector === 'pointer') {
          prev.hasPointerEvents = true;
        }

        return prev;
      },
      {
        hasAnimations: false,
        hasGroupEvents: false,
        hasPointerEvents: false,
        isGroupParent: false,
      } as RuntimeComponentEntry['metadata'],
    );
}

export const getChildRuntimeEntries = (runtimeEntries: RuntimeComponentEntry[]) => {
  return pipe(
    runtimeEntries,
    RA.flatMap((runtimeEntry) =>
      runtimeEntry.entries.filter((entry) => {
        const group = getRuleSelectorGroup(entry.selectors);
        return (
          group === 'first' || group === 'last' || group === 'even' || group === 'odd'
        );
      }),
    ),
    // RA.map(runtimeEntry => {
    //   const entries = runtimeEntries.filter(x => x.)
    //   return {

    //   }
    // })
  );
};

export const getEntriesObject = (runtime: SheetEntry[]): SheetGroupEntries => {
  return runtime.reduce<SheetGroupEntries>(
    (prev, current) => {
      const group = getRuleSelectorGroup(current.selectors);
      const selectors = pipe(
        current.selectors,
        RA.filter((group) => {
          return (
            !group.includes('first') &&
            !group.includes('last') &&
            !group.includes('even') &&
            !group.includes('odd')
          );
        }),
      );
      prev[group].push({
        ...current,
        selectors,
      });

      return prev;
    },
    {
      base: [],
      dark: [],
      even: [],
      first: [],
      group: [],
      last: [],
      odd: [],
      pointer: [],
    },
  );
};

export const excludeChildEntries = (entries: RuntimeComponentEntry[]) => {
  return pipe(
    entries,
    RA.map((entry) => {
      entry.entries = entry.entries.filter((x) => {
        const group = getRuleSelectorGroup(x.selectors);
        if (group === 'first') return false;
        if (group === 'last') return false;
        if (group === 'even') return false;
        if (group === 'odd') return false;
        return true;
      });
      return entry;
    }),
  );
};

export const mergeChildEntries = (
  original: RuntimeComponentEntry[],
  entries: SheetEntry[],
) => {
  return pipe(
    original,
    RA.map((runEntry) => {
      const nextEntries = pipe(
        RA.appendAll(runEntry.entries, entries),
        RA.sort(sheetEntriesOrder),
      );
      return {
        ...runEntry,
        entries: nextEntries,
      };
    }),
  );
};

export const mergeSheetEntries = (
  currentEntries: RuntimeComponentEntry[],
  parentEntries: SheetEntry[],
  order: number,
  parentChildsNumber: number,
): RuntimeComponentEntry[] => {
  const entriesToPush: SheetEntry[] = pipe(
    parentEntries,
    RA.filter((x) => {
      const group = getRuleSelectorGroup(x.selectors);
      if (group === 'first' && order === 0) return true;
      if (group === 'last' && order === parentChildsNumber - 1) return true;
      if (group === 'even' && order % 2 === 0) return true;
      if (group === 'odd' && order % 2 !== 0) return true;
      return false;
    }),
    RA.map((x) => ({
      ...x,
      selectors: x.selectors.filter(
        (y) =>
          !y.includes('first') ||
          !y.includes('last') ||
          !y.includes('even') ||
          !y.includes('odd'),
      ),
    })),
  );

  return pipe(
    currentEntries,
    RA.map((runEntry) => {
      const nextEntries = pipe(
        RA.appendAll(runEntry.entries, entriesToPush),
        RA.sort(sheetEntriesOrder),
      );
      return {
        ...runEntry,
        entries: nextEntries,
      };
    }),
  );
};

export const sheetEntriesOrder = Order.make((a: SheetEntry, b: SheetEntry) => {
  if (a.important && !b.important) return 1;
  if (!a.important && b.important) return -1;
  if (a.precedence > b.precedence) return 1;
  if (a.precedence === b.precedence) return 0;
  return -1;
});
