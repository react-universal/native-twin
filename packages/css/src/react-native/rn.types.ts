import type { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';

// TODO: rm
export type NamedStyles<T> = StyleSheet.NamedStyles<T>;
// TODO: rm
export type AnyStyle = ImageStyle | TextStyle | ViewStyle;
// TODO: rm
export interface CompleteStyle extends ViewStyle, TextStyle, Omit<ImageStyle, 'overflow'> {}
// TODO: rm
export type AnyStyleValue = {
  [U in keyof AnyStyle]: AnyStyle[U];
}[keyof AnyStyle];
