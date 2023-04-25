import type { ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;
export type AtomStyle = { [k: string]: AnyStyle };
export type ComponentStyleProp = StyleProp<AnyStyle>;

export type StyledProps<P> = {
  className?: string;
  tw?: string;
  nthChild: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  parentID?: string;
  children?: ReactNode;
  style?: AnyStyle;
  groupID?: string;
} & P;

export type ComponentStylesheet = {
  base: AnyStyle;
  pointerStyles: AnyStyle;
  first: AnyStyle;
  last: AnyStyle;
  odd: AnyStyle;
  even: AnyStyle;
  group: AnyStyle;
};
export type GeneratedAtomsStyle = {
  [k: string]: AnyStyle;
};
export type GeneratedComponentsStyleSheet = {
  [k: string]: ComponentStylesheet;
};

export interface IUseStyleSheetsInput
  extends StyledProps<{
    inlineStyles?: AnyStyle;
    classPropsTuple?: [string, string][];
    componentID: string;
    currentGroupID: string;
  }> {}
