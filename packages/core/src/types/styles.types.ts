import type { StyleProp } from 'react-native';

export type IStyleType<T = unknown> = StyleProp<T>;
export type IStyleTuple = [string, IStyleType];
