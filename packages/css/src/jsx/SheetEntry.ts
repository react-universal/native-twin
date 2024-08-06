import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Order from 'effect/Order';
import * as Predicate from 'effect/Predicate';
import { OwnSheetSelectors } from '../css/css.constants';
import type { ValidChildPseudoSelector } from '../css/css.types';
import type { SheetEntry } from '../sheets/sheet.types';
import { getRuleSelectorGroup } from '../tailwind/tailwind.utils';
import {
  compileEntryDeclaration,
  RuntimeSheetDeclaration,
} from './SheetEntryDeclaration';
import { CompilerContext } from './metro.runtime';

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

export const compileSheetEntry = (
  sheetEntry: SheetEntry,
  ctx: CompilerContext,
): RuntimeSheetEntry => {
  const declarations = pipe(
    sheetEntry.declarations,
    RA.map((x) => compileEntryDeclaration(x, ctx)),
  );
  return {
    ...sheetEntry,
    declarations,
  };
};

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
