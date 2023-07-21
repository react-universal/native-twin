import type {
  ClassAttributes,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import type { ReactNode } from 'react';
import type { StyleProp } from 'react-native';
import type { AnyStyle, CompleteStyle, FinalSheet } from '@universal-labs/css';
import type {
  ValidGroupPseudoSelector,
  ValidInteractionPseudoSelector,
} from '../constants/ValidPseudoElements';

export type ForwardRef<T, P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>;
export type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R>
  ? R
  : unknown;

export type ComponentStyleProp = StyleProp<AnyStyle>;

export interface RegisteredComponent {
  id: string;
  groupID: string;
  interactionState: Record<ValidInteractionPseudoSelector | ValidGroupPseudoSelector, boolean>;
}

export type StyledProps<P> = {
  className?: string;
  tw?: string;
  nthChild?: number;
  isFirstChild?: boolean;
  isLastChild?: boolean;
  parentID?: string;
  children?: ReactNode;
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

export type PropsFrom<TComponent> = TComponent extends React.FC<infer Props>
  ? Props
  : TComponent extends React.Component<infer Props>
  ? Props
  : TComponent extends React.ComponentType<infer Props>
  ? Props
  : never;

export type ForwardedStyledComponent<Component> = ForwardRefExoticComponent<
  PropsFrom<Component> & StyledProps<{}>
>;

// @typescript-eslint/no-empty-interface
export interface DefaultTheme {}

export type Primitive = number | string | null | undefined | boolean | CompleteStyle;
export type TemplateFunctions<T> = (
  arg: T & { className?: string; tw?: string; theme?: DefaultTheme },
) => Primitive;
