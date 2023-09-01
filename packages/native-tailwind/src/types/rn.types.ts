import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;

export type FinalSheet = Record<SelectorGroup, AnyStyle>;

export type CompleteStyle = ViewStyle & TextStyle & ImageStyle;

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
