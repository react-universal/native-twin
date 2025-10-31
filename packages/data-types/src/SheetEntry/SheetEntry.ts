import { hash } from '@native-twin/helpers';
import { Equality } from '../internal';
import type { SheetEntryDeclaration } from './SheetEntryDeclaration';

export namespace SheetEntry {
  export interface SortableEntry {
    precedence: number;
    important: boolean;
  }

  export interface SheetEntry extends SortableEntry {
    className: string;
    declarations: SheetEntryDeclaration[];
    animations: any[];
    /** The rule sets (selectors and at-rules). expanded variants `@media ...`, `@supports ...`, `&:focus`, `.dark &` */
    selectors: string[];
    preflight: boolean;
  }
}

const CacheValues = new WeakMap<object, string>();

export const getSheetEntryKey = (self: SheetEntry.SheetEntry) =>
  hash(
    `${self.className}~${self.important}~${self.precedence}~${self.selectors.join('')}~${self.preflight}`,
  );

export const of = (data: SheetEntry.SheetEntry): SheetEntry.SheetEntry =>
  Object.defineProperties(
    data,
    Object.getOwnPropertyDescriptors({
      get own(): SheetEntry.SheetEntry {
        return this as any;
      },
      [Equality.eqSymbol](this: SheetEntry.SheetEntry, that) {
        return this === that || this[Equality.hashSymbol] === that[Equality.hashSymbol];
      },
      get [Equality.hashSymbol]() {
        const cached = CacheValues.get(this);
        if (cached) return cached;

        const hashValue = getSheetEntryKey(this.own);
        CacheValues.set(this.own, hashValue);
        return hashValue;
      },
    }),
  );

export const isEqual = (self: SheetEntry.SheetEntry, that: SheetEntry.SheetEntry): boolean => {
  if (self === that) return true;

  if (self[Equality.hashSymbol] && that[Equality.hashSymbol]) {
    return that[Equality.eqSymbol](self);
  }

  if (
    self.declarations.length !== that.declarations.length ||
    self.selectors.length !== that.selectors.length ||
    self.important !== that.important ||
    self.precedence !== that.precedence
  ) {
    return false;
  }

  if (self[Equality.hashSymbol] && that[Equality.hashSymbol]) {
    return that[Equality.eqSymbol](self);
  }

  return false;
};
