import type {
  ImageStyle,
  TextStyle,
  ViewStyle, // FlexAlignType,
  // DimensionValue,
} from 'react-native';
import { SelectorGroup } from '../css/css.types';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;

export interface CompleteStyle extends ViewStyle, TextStyle, Omit<ImageStyle, 'overflow'> {}

export interface RuntimeContext {
  rem: number;
  deviceHeight: number;
  deviceWidth: number;
}

export type FinalSheet = Record<SelectorGroup, CompleteStyle>;

export interface GetChildStylesArgs {
  isFirstChild: boolean;
  isLastChild: boolean;
  isEven: boolean;
  isOdd: boolean;
}
