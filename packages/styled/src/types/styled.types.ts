import type {
  ClassAttributes,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';
import type { StyleProp } from 'react-native/types';

export type ForwardRef<T, P> = ForwardRefExoticComponent<
  PropsWithoutRef<P> & RefAttributes<T>
>;
export type InferRef<T> = T extends RefAttributes<infer R> | ClassAttributes<infer R>
  ? R
  : unknown;

export type StyledOptions<T, P extends keyof T = never> = T[P] extends StyleProp<any>
  ? P[]
  : never;

export type StyledProps<P> = {
  className?: string;
  tw?: string;
} & P;
