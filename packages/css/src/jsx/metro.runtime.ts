import type { SheetEntry } from './SheetEntry';

export interface StyledPropEntries {
  entries: SheetEntry[];
  prop: string;
  target: string;
  expression: string | null;
  classNames: string;
}

/** @category MetroBundler */
export interface CompilerContext {
  baseRem: number;
  platform: string;
}
