import type { StyleProp } from 'react-native';
import type { FinalRule } from '../css/rules';
import type { Falsey, StringLike } from './util.types';

export type CSSValue =
  | string
  | number
  | bigint
  | Falsey
  | StringLike
  | StyleProp<any>
  | CSSValue[];

export interface CXProcessor {
  (classNames: string): { generated: string; target: string[] };
  hash(classNames: string): string;
}

export interface GetChildStyles {
  isFirstChild: boolean;
  isLastChild: boolean;
  isEven: boolean;
  isOdd: boolean;
}

export interface Sheet<Target = unknown> {
  readonly target: Map<string, Target>;
  insert(key: string, rule: FinalRule): void;
  getClassName(key: string): FinalRule | undefined;
  // snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  // resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}
