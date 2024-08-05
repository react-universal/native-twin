import type { SheetGroupEntries } from './SheetEntry';
import type { RuntimeComponentEntry } from './react.runtime';

export type SheetChildEntries = Pick<SheetGroupEntries, 'first' | 'last' | 'even' | 'odd'>;

export interface JSXElementSheet {
  propEntries: RuntimeComponentEntry[];
  childEntries: SheetChildEntries;
}
