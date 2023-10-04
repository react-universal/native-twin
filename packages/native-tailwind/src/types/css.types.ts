import type { StyleProp } from 'react-native';
import type { AnyStyle, SelectorGroup } from '@universal-labs/css';
import type { ParsedRule } from './tailwind.types';
import type { Falsey, StringLike } from './util.types';

export type CSSValue =
  | string
  | number
  | bigint
  | Falsey
  | StringLike
  | StyleProp<any>
  | CSSValue[];

export type SheetEntryTransformDeclaration = [
  prop: 'transform',
  transform: [transformProp: string, value: string][],
];

export type SheetEntryDeclaration =
  | [prop: string, value: string | AnyStyle]
  | SheetEntryTransformDeclaration;

export interface SheetEntry {
  className: string;
  group: SelectorGroup;
  rule: ParsedRule;
  declarations: SheetEntryDeclaration[];
  mql: string[];
}

export interface Sheet<Target = unknown> {
  readonly target: Target;
  insert(entry: SheetEntry, index: number): void;
  snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}
