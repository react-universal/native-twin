import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import * as Record from 'effect/Record';
import { OwnSheetSelectors } from '../css/css.constants';
import type { SelectorGroup, ValidChildPseudoSelector } from '../css/css.types';
import type { SheetEntry } from '../sheets/sheet.types';
import { getRuleSelectorGroup } from '../tailwind/tailwind.utils';
import { compileEntryDeclaration, RuntimeSheetDeclaration } from './SheetEntryDeclaration';
import { defaultSheetMetadata } from './constants';
import { SheetChildEntries } from './jsx.runtime';
import type { RuntimeComponentEntry } from './react.runtime';

export type { SheetEntry };

export interface RuntimeSheetEntry extends Omit<SheetEntry, 'declarations'> {
  declarations: RuntimeSheetDeclaration[];
}

interface ChildSelectorBrand {
  readonly ChildSelector: unique symbol;
}
type ChildSelector = ValidChildPseudoSelector & ChildSelectorBrand;

interface OwnSelectorBrand {
  readonly OwnSelector: unique symbol;
}
type OwnSelector = (typeof OwnSheetSelectors)[number] & OwnSelectorBrand;

export type SheetGroupEntries = Record<SelectorGroup, RuntimeSheetEntry[]>;

export const compileSheetEntry = (sheetEntry: SheetEntry): RuntimeSheetEntry => {
  const declarations = pipe(
    sheetEntry.declarations,
    RA.map((x) => compileEntryDeclaration(x)),
  );
  return {
    ...sheetEntry,
    declarations,
  };
};

export const groupEntriesBySelectorGroup = (
  x: RuntimeSheetEntry[],
): Record<SelectorGroup, RuntimeSheetEntry[]> =>
  RA.groupBy(x, (entry) => getRuleSelectorGroup(entry.selectors));

export const getChildRuntimeEntries = (
  runtimeEntries: RuntimeComponentEntry[],
): SheetChildEntries => {
  return pipe(
    runtimeEntries,
    RA.map((runtimeEntry) => runtimeEntry.entries),
    RA.reduce(
      {
        first: [],
        last: [],
        even: [],
        odd: [],
      } as SheetChildEntries,
      (prev, current) => {
        prev.first.push(...current.first);
        prev.last.push(...current.last);
        prev.even.push(...current.even);
        prev.odd.push(...current.odd);
        return prev;
      },
    ),
  );
};

export const getGroupedEntries = (runtime: RuntimeSheetEntry[]): SheetGroupEntries => {
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
  parentEntries: SheetChildEntries,
  order: number,
  parentChildsNumber: number,
): RuntimeComponentEntry[] => {
  return pipe(
    currentEntries,
    RA.map((entry) => {
      const newEntries = entry.entries;
      if (order === 0) newEntries.base.push(...parentEntries.first);
      if (order === parentChildsNumber - 1) newEntries.base.push(...parentEntries.last);
      if (order % 2 === 0) newEntries.base.push(...parentEntries.even);
      if (order % 2 !== 0) newEntries.base.push(...parentEntries.odd);
      return {
        ...entry,
        entries: newEntries,
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

/** @category Orders */
const orders = {
  sheetEntriesOrderByPrecedence: Order.mapInput(
    Order.number,
    (a: RuntimeSheetEntry) => a.precedence,
  ),
  sheetEntriesByImportant: Order.mapInput(
    Order.boolean,
    (a: RuntimeSheetEntry) => a.important,
  ),
};

/** @category Orders */
export const sortSheetEntries = (x: RuntimeSheetEntry[]) =>
  RA.sort(
    x,
    Order.combine(orders.sheetEntriesOrderByPrecedence, orders.sheetEntriesByImportant),
  );

/** @category Predicates */
export const isChildEntry: Predicate.Predicate<RuntimeSheetEntry> = (entry) =>
  pipe(entry.selectors, getRuleSelectorGroup, isChildSelector);

/** @category Predicates */
export const isChildSelector: Predicate.Refinement<string, ChildSelector> = (
  group,
): group is ChildSelector =>
  group === 'first' || group === 'last' || group === 'even' || group === 'odd';

/** @category Predicates */
export const isOwnSelector: Predicate.Refinement<string, OwnSelector> = (
  group,
): group is OwnSelector => OwnSheetSelectors.includes(group as OwnSelector);

/** @category Predicates */
export const isPointerEntry: Predicate.Predicate<RuntimeSheetEntry> = (entry) =>
  pipe(entry.selectors, getRuleSelectorGroup, (x) => x === 'group' || x === 'pointer');

/** @category Predicates */
export const isGroupEventEntry: Predicate.Predicate<RuntimeSheetEntry> = (entry) =>
  pipe(entry.selectors, getRuleSelectorGroup, (x) => x === 'group');

/** @category Predicates */
export const isGroupParent: Predicate.Predicate<RuntimeSheetEntry> = (entry) =>
  pipe(entry.selectors, RA.contains('group'));
