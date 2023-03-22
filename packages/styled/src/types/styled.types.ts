import type {
  ClassAttributes,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';

export type ForwardRef<T, P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>;
export type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R>
  ? R
  : unknown;

export type IBaseClassNameOrOptions = string | {};

export type Style = ViewStyle | TextStyle | ImageStyle;

export interface StyledOptions<T, P extends keyof T = never> {
  props?: Partial<Record<P, true>>;
  baseClassName?: string;
}

export type StyledProps<P> = {
  className?: string;
  tw?: string;
  baseClassName?: string;
  baseTw?: string;
} & P;
