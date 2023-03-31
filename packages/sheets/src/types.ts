import type { ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type IStyleProp = StyleProp<ImageStyle | TextStyle | ViewStyle>;
export type IStyleType = Record<string, ImageStyle | TextStyle | ViewStyle>;

export type StyledProps<P> = {
  className?: string;
  tw?: string;
  nthChild: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  parentID?: string;
  children?: ReactNode;
  style?: IStyleProp;
} & P;

export interface IUseStyleSheetsInput
  extends StyledProps<{
    inlineStyles?: IStyleProp;
    classPropsTuple?: [string, string][];
  }> {}
