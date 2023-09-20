import type { AnyStyle } from '@universal-labs/css';
import type { ParsedRule } from '@universal-labs/css/tailwind';
import type { Falsey, StringLike } from './util.types';

export type CSSValue = string | number | bigint | Falsey | StringLike;

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
  insert(key: string, rule: ParsedRule, styles: Target): void;
  getClassName(key: string): AnyStyle | undefined;
  // snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  // resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}
