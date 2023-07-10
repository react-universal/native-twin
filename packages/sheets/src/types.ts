import type { ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import type { AnyStyle, FinalSheet } from '@universal-labs/css';

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
  styles: FinalSheet;
  hash: string;
  isGroupParent: boolean;
  hasPointerEvents: boolean;
  hasGroupEvents: boolean;
};

export interface IUseStyleSheetsInput
  extends StyledProps<{
    inlineStyles?: AnyStyle;
    classPropsTuple?: [string, string][];
    componentID: string;
    currentGroupID: string;
  }> {}
