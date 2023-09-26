import type {
  ImageStyle,
  TextStyle,
  ViewStyle,
  FlexAlignType,
  DimensionValue,
} from 'react-native';
import type { SelectorGroup } from './css.types';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;

export interface GetChildStylesArgs {
  isFirstChild: boolean;
  isLastChild: boolean;
  isEven: boolean;
  isOdd: boolean;
}

export type PartialStyle = ImageStyle | TextStyle | ViewStyle;

export type FinalSheet = Record<SelectorGroup, CompleteStyle>;

export interface CompleteStyle extends ViewStyle, TextStyle, Omit<ImageStyle, 'overflow'> {}

export type { FlexAlignType, DimensionValue };
