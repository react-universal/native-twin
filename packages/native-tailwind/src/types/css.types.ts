import type { CSSProperties } from 'react';
import type { Falsey, StringLike } from './util.types';

export type CSSValue = string | number | bigint | Falsey | StringLike;

export type { CSSProperties };

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
  readonly target: Target;
  insert(cssText: string, index: number): void;
  snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}
