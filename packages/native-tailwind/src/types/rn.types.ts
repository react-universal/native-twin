import type {
  ImageStyle,
  TextStyle,
  ViewStyle,
  FlexAlignType,
  DimensionValue,
} from 'react-native';

export type SelectorGroup = 'base' | 'group' | 'pointer' | 'first' | 'last' | 'odd' | 'even';

export type PartialStyle = ImageStyle | TextStyle | ViewStyle;

export type FinalSheet = Record<SelectorGroup, CompleteStyle>;

export interface CompleteStyle extends ViewStyle, TextStyle, Omit<ImageStyle, 'overflow'> {}

export type { FlexAlignType, DimensionValue };
