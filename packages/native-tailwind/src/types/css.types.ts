import type { CSSProperties } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { Falsey, StringLike } from './util.types';

export type CSSValue = string | number | bigint | Falsey | StringLike;

export type { CSSProperties };

export type AnyReactNativeStyle = TextStyle & ViewStyle & ImageStyle;

export interface Sheet<Target = unknown> {
  readonly target: Target;
  insert(cssText: string, index: number): void;
  snapshot(): () => void;
  /** Clears all CSS rules from the sheet. */
  clear(): void;
  destroy(): void;
  resume(addClassName: (className: string) => void, insert: (cssText: string) => void): void;
}
