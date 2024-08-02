import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import type { TypeLambda } from 'effect/HKT';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import type { SelectorGroup } from '../css/css.types';
import type { SheetEntry } from '../sheets/sheet.types';
import { getRuleSelectorGroup } from '../tailwind/tailwind.utils';
import type { StyledPropEntries } from './metro.runtime';
import type { RuntimeComponentEntry } from './react.runtime';

export type { SheetEntry };

type SheetEntryW<A> = CompiledEntry<A> | RawEntry;

interface CompiledEntry<A> {
  _tag: 'CompiledEntry';
  prop: string;
  value: A;
}
interface RawEntry {
  _tag: 'RawEntry';
  value: SheetEntry;
}

/** @category symbols */
export const TypeId: unique symbol = Symbol.for('effect/SheetEntry');
/** @category symbols */
export type TypeId = typeof TypeId;

export interface SheetEntryTypeLambda extends TypeLambda {
  readonly type: SheetEntryW<this['Target']>;
}

export const identity = <A extends SheetEntry>(x: A) => x;

export type SheetGroupEntries = Record<SelectorGroup, SheetEntry[]>;

export const createComponentSheet = (propEntries: RuntimeComponentEntry[]) => {
  const allEntries = pipe(
    propEntries,
    RA.flatMap((x) => x.entries),
    sortSheetEntries,
  );
  const childsSheet = pipe(
    allEntries,
    RA.filter((x) => isChildEntry(x)),
    groupEntriesBySelectorGroup,
  );
  return { childsSheet };
};

const sheetEntriesOrderByPrecedence = Order.make((a: SheetEntry, b: SheetEntry) => {
  if (a.precedence > b.precedence) return 1;
  if (a.precedence === b.precedence) return 0;
  return -1;
});

const sheetEntriesByImportant = Order.make((a: SheetEntry, b: SheetEntry) => {
  if (a.important && !b.important) return 1;
  if (a.important && b.important) return 0;
  return -1;
});

export const sortSheetEntries = (x: SheetEntry[]) =>
  RA.sort(x, Order.combine(sheetEntriesOrderByPrecedence, sheetEntriesByImportant));

export const groupEntriesBySelectorGroup = (
  x: SheetEntry[],
): Record<SelectorGroup, SheetEntry[]> =>
  RA.groupBy(x, (entry) => getRuleSelectorGroup(entry.selectors));

export const isChildEntry: Predicate.Predicate<SheetEntry> = (x: SheetEntry) => {
  const group = getRuleSelectorGroup(x.selectors);
  return group === 'first' || group === 'last' || group === 'even' || group === 'odd';
};

export const getChildRuntimeEntries = (
  runtimeEntries: RuntimeComponentEntry[],
): Record<SelectorGroup, SheetEntry[]> => {
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
    sortSheetEntries,
    RA.groupBy((x) => getRuleSelectorGroup(x.selectors)),
  );
};

export const getEntriesObject = (runtime: SheetEntry[]): SheetGroupEntries => {
  return runtime.reduce<SheetGroupEntries>(
    (prev, current) => {
      const group = getRuleSelectorGroup(current.selectors);
      prev[group].push({
        ...current,
        selectors: RA.filter(current.selectors, (group) => {
          return (
            !group.includes('first') &&
            !group.includes('last') &&
            !group.includes('even') &&
            !group.includes('odd')
          );
        }),
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
      const nextEntries = pipe(RA.appendAll(runEntry.entries, entries), sortSheetEntries);
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
        sortSheetEntries,
      );
      return {
        ...runEntry,
        entries: nextEntries,
      };
    }),
  );
};

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
