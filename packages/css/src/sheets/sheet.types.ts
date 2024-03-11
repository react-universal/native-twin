import { MaybeArray } from '@universal-labs/helpers';
import { AnyStyle } from '../react-native/rn.types';

export type Preflight = false | MaybeArray<Record<string, any>>;

export interface Sheet<Target = unknown> {
  readonly target: Target;
  insert(entry: SheetEntry, index: number): void;
  snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
  insertPreflight(data: Preflight): string[];
}

export interface SheetEntry {
  className: string;
  declarations: SheetEntryDeclaration[];
  /** The rule sets (selectors and at-rules). expanded variants `@media ...`, `@supports ...`, `&:focus`, `.dark &` */
  selectors: string[];
  precedence: number;
  important: boolean;
}

export type SheetEntryDeclaration = {
  prop: string;
  value: string | AnyStyle | SheetEntryDeclaration[];
};

export interface SheetEntryCss extends Omit<SheetEntry, 'declarations'> {
  declarations: string;
}

export type SheetEntryTransformDeclaration = [
  prop: 'transform',
  transform: [transformProp: string, value: string][],
];

export interface SheetInteractionState {
  isPointerActive: boolean;
  isParentActive: boolean;
}
