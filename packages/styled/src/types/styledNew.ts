import type {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementType,
  FunctionComponent,
  ReactElement,
} from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native/types';
import type { ConfigVariants, VariantsConfig } from '../variants';

type StringKeys<T> = Extract<keyof T, string>;

type Style = ViewStyle | TextStyle | ImageStyle;

export type ClassProp =
  | { tw?: never; className?: string }
  | { tw?: string; className?: never };

export type TransformConfigOption<T = string> = {
  name?: T;
  value?: keyof Style;
  class?: boolean;
};

type TransformProps<T, TTransform> = Record<keyof TTransform, string> &
  Omit<T, Extract<keyof T, keyof TransformMapping<TTransform>>>;

type TransformMapping<TTransform> = {
  [Key in keyof TTransform as InferTransformAlias<Key, TTransform[Key]>]: Key;
};

type InferTransformAlias<K, V> = K extends string
  ? V extends true
    ? K
    : V extends string
    ? V
    : V extends { name: infer N }
    ? N extends string
      ? N
      : never
    : V extends Record<string, unknown>
    ? K
    : never
  : never;

type SetOptional<T, K extends string> = Omit<T, Extract<K, keyof T>> &
  Partial<Pick<T, Extract<K, keyof T>>>;

type OptionalProps<T> = Exclude<
  {
    [Key in keyof T]: T extends Record<Key, T[Key]> ? never : Key;
  }[keyof T],
  undefined
>;

type OptionalTransformProps<T, TTransform> = Extract<
  TransformMapping<TTransform>[Extract<keyof TransformMapping<TTransform>, OptionalProps<T>>],
  string
>;

type TransformSchema<T> = Record<string, T | true | TransformConfigOption<T>>;

type DefaultProps<T, TVariants, TTransform> = Partial<
  TransformProps<T, TTransform> | ConfigVariants<TVariants>
>;

export type StyledOptions<T, TVariants, TTransform, TDefaultProps> =
  VariantsConfig<TVariants> & {
    props?: TTransform & TransformSchema<keyof T>;
    defaultProps?: TDefaultProps & DefaultProps<T, TVariants, TTransform>;
    compoundVariants?: Array<
      { [K in keyof T]?: T[K] | boolean } & ClassProp & ConfigVariants<TVariants>
    >;
  };

export type StyledComponentProps<T, TVariants, TTransform, TDefaultProps> = SetOptional<
  TransformProps<T, TTransform> & Omit<ConfigVariants<TVariants>, keyof T> & ClassProp,
  StringKeys<TDefaultProps> | OptionalTransformProps<T, TTransform>
>;

export type StyledFunctionComponent<
  T extends ElementType,
  TVariants = unknown,
  TTransform = unknown,
  TDefaultProps = unknown,
> = FunctionComponent<
  StyledComponentProps<ComponentPropsWithRef<T>, TVariants, TTransform, TDefaultProps>
>;

export type Styled = {
  // styled(Text) OR styled(Text, "default")
  <T extends ElementType>(component: T, defaultClassName?: string): StyledFunctionComponent<T>;
  // styled(Text, { ...OPTIONS })
  <T extends ElementType, TVariants, TTransform, TDefaultProps>(
    component: T,
    options: StyledOptions<ComponentPropsWithoutRef<T>, TVariants, TTransform, TDefaultProps>,
  ): StyledFunctionComponent<T, TVariants, TTransform, TDefaultProps>;
  // styled(Text, "default", { ...OPTIONS })
  <T extends ElementType, TVariants, TTransform, TDefaultProps>(
    component: T,
    defaultClassName: string,
    options: StyledOptions<ComponentPropsWithoutRef<T>, TVariants, TTransform, TDefaultProps>,
  ): StyledFunctionComponent<T, TVariants, TTransform, TDefaultProps>;
};

export type StyledComponentType = {
  <T>(
    props: T &
      ClassProp & {
        component: ElementType<T>;
      },
  ): ReactElement<T>;
};

export type StyledProps<P> = P & ClassProp;

export type AnyStyledOptions = StyledOptions<any, any, any, any>;

// type TMapClassNames<T, K extends readonly (keyof T)[]> = {
//   [P in keyof T]: P extends keyof T[K[number]] ? string : T[P];
// };

// type TClass = TMapClassNames<ViewProps, ['hitSlop']>;

// WANED
// type TMapClassNames<T, K extends keyof T> = {
//   [P in keyof T]: P extends K ? string : T[P];
// };

// type MyProps = {
//   user: { name: string };
//   style: { color: number[] };
//   age: number;
// };

// const arrayOfKey = ['style'] as const;

// type KeyOfMys = (typeof arrayOfKey)[number];
