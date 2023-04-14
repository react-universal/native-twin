import type { ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type AnyStyle = ImageStyle | TextStyle | ViewStyle;
export type AtomStyle = { [k: string]: AnyStyle };
export type ComponentStyleProp = StyleProp<AnyStyle>;
export type StyledObject = Record<string, AnyStyle>;

export type StyledProps<P> = {
  className?: string;
  tw?: string;
  nthChild: number;
  isFirstChild: boolean;
  isLastChild: boolean;
  parentID?: string;
  children?: ReactNode;
  style?: StyledObject;
  groupID?: string;
} & P;

export type ComponentStylesheet = {
  base: AnyStyle;
  hover: AnyStyle;
  focus: AnyStyle;
  active: AnyStyle;
  children: AnyStyle;
};
export type GeneratedAtomsStyle = {
  [k: string]: StyledObject;
};
export type GeneratedComponentsStyleSheet = {
  [k: string]: ComponentStylesheet;
};

export interface IUseStyleSheetsInput
  extends StyledProps<{
    inlineStyles?: StyledObject;
    classPropsTuple?: [string, string][];
    componentID: string;
    currentGroupID: string;
  }> {}
