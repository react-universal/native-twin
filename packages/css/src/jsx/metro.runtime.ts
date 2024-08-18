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

export interface RawJSXElementTreeNode {
  node: string;
  order: number;
  parentNode: RawJSXElementTreeNode | null;
  childs: RawJSXElementTreeNode[];
  id: string;
  fileName: string;
}
