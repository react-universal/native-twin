import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { SelectorGroup } from './css.types';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;

export type FinalSheet = Record<SelectorGroup, AnyStyle>;
