import type { AnyStyle, FinalSheet, GetChildStylesArgs } from '../react-native/rn.types';
import type { SheetInteractionState } from '../sheets/sheet.types';
import { RuntimeGroupSheet } from './Sheet';
import type { RuntimeSheetEntry } from './SheetEntry';

/** @category jsxComponent */
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

/** @category jsxComponent */
export interface ComponentSheet {
  prop: string;
  target: string;
  sheet: FinalSheet;
  getChildStyles(input: Partial<GetChildStylesArgs>): AnyStyle;
  getStyles: (
    input: Partial<SheetInteractionState>,
    templateEntries?: RuntimeSheetEntry[],
  ) => AnyStyle;
  compiledSheet: RuntimeComponentEntry;
  metadata: {
    isGroupParent: boolean;
    hasGroupEvents: boolean;
    hasPointerEvents: boolean;
    hasAnimations: boolean;
  };
  recompute(compiledSheet: RuntimeComponentEntry): ComponentSheet;
}

/** @category jsxComponent */
export interface RuntimeComponentEntry {
  prop: string;
  target: string;
  templateLiteral: string | null;
  rawSheet: RuntimeGroupSheet;
  childEntries: RuntimeSheetEntry[];
  entries: RuntimeSheetEntry[];
  // precompiled: FinalSheet;
}
