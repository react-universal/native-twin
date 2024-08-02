import type { SheetGroupEntries } from './SheetEntry';
import type { RuntimeComponentEntry } from './react.runtime';

export interface JSXElementSheet {
  propEntries: RuntimeComponentEntry[];
  childEntries: SheetGroupEntries;
}
