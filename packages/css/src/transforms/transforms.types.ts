import type { CompleteStyle } from '../react-native/rn.types';

export type DefaultTheme = {};

export type Primitive = number | string | null | undefined | boolean | CompleteStyle;

export type TemplateFunctions<T extends object> = (arg: T & { theme?: DefaultTheme }) => Primitive;
