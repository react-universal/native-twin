import type { SelectorGroup, SheetEntry } from '@native-twin/css';
import type { ComponentSheet } from '@native-twin/jsx/build/sheet';

export type SheetGroupEntries = Record<SelectorGroup, SheetEntry[]>;

export interface RuntimeComponentEntry {
  prop: string;
  target: string;
  entries: SheetEntry[];
  templateLiteral: string | null;
  metadata: ComponentSheet['metadata'];
  groupedEntries: SheetGroupEntries;
}

export interface StyledPropEntries {
  entries: SheetEntry[];
  prop: string;
  target: string;
  expression: string | null;
  classNames: string;
}
