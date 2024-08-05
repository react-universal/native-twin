import type { AnyStyle, FinalSheet, GetChildStylesArgs } from '../react-native/rn.types';
import type { SheetEntry, SheetInteractionState } from '../sheets/sheet.types';
import type { RuntimeSheetEntry, SheetGroupEntries } from './SheetEntry';

export interface RegisteredComponent {
  id: string;
  sheets: ComponentSheet[];
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
    hasAnimations: boolean;
  };
}

export interface ComponentSheet {
  prop: string;
  target: string;
  sheet: FinalSheet;
  getChildStyles(input: Partial<GetChildStylesArgs>): AnyStyle;
  getStyles: (
    input: Partial<SheetInteractionState>,
    templateEntries?: SheetEntry[],
  ) => AnyStyle;
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
    hasAnimations: boolean;
  };
  recompute(): ComponentSheet;
}

export interface RuntimeComponentEntry {
  prop: string;
  target: string;
  templateLiteral: string | null;
  metadata: ComponentSheet['metadata'];
  entries: SheetGroupEntries;
  rawEntries: RuntimeSheetEntry[];
}
