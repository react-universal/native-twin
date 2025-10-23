import type { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';

export type NamedStyles<T> = StyleSheet.NamedStyles<T>;
export type AnyStyle = ImageStyle | TextStyle | ViewStyle;

export interface CompleteStyle extends ViewStyle, TextStyle, Omit<ImageStyle, 'overflow'> {}

export type AnyStyleValue = {
  [U in keyof AnyStyle]: AnyStyle[U];
}[keyof AnyStyle];
