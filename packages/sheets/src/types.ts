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
  hash: string;
  baseStyles: AnyStyle | (() => AnyStyle);
  pointerStyles: AnyStyle | (() => AnyStyle);
  groupStyles: AnyStyle | (() => AnyStyle);
  first: AnyStyle | (() => AnyStyle);
  last: AnyStyle | (() => AnyStyle);
  odd: AnyStyle | (() => AnyStyle);
  even: AnyStyle | (() => AnyStyle);
  isGroupParent: boolean;
  hasPointerEvents: boolean;
  hasGroupeEvents: boolean;
};
export type GeneratedAtomsStyle = {
  [k: string]: AnyStyle;
};
export type GeneratedComponentsStyleSheet = {
  [k: string]: ComponentStylesheet;
};

export interface DeclarationWithStyles {
  base: [string, string][];
  group: [string, string][];
  pointer: [string, string][];
  first: [string, string][];
  last: [string, string][];
  odd: [string, string][];
  even: [string, string][];
}

export interface IUseStyleSheetsInput
  extends StyledProps<{
    inlineStyles?: AnyStyle;
    classPropsTuple?: [string, string][];
    componentID: string;
    currentGroupID: string;
  }> {}
