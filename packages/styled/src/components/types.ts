import type { CompleteStyle } from '@native-twin/css';
import type {
  ClassicComponentClass,
  ComponentClass,
  ComponentProps,
  ForwardRefExoticComponent,
  FunctionComponent,
  JSXElementConstructor,
} from 'react';
import type { DotNotation, ResolveDotPath } from './DotNotation';

export type ReactComponent<T = any> =
  | ClassicComponentClass<T>
  | ComponentClass<T>
  | FunctionComponent<T>
  | ForwardRefExoticComponent<T>;

export type ComponentConfig = {
  target: string;
  source: string;
  nativeStyleToProp?: NativeStyleToProp<any>;
};

/** Used */

export type StylableComponentConfigOptions<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
> = Record<string, ComponentClassNamePropConfig<ComponentProps<T>>>;

export type ComponentClassNamePropConfig<P> =
  | undefined
  | boolean
  | (keyof P & string)
  | {
      target: (keyof P & string) | boolean;
      nativeStyleToProp?: NativeStyleToProp<P>;
    };

export type NativeStyleToProp<P> = {
  [K in keyof CompleteStyle & string]?: K extends keyof P
    ? (keyof P & string) | true
    : keyof P & string;
};

export type StyledProps<P, M extends StyledConfiguration<any>> = P & {
  [K in keyof M as K extends string
    ? M[K] extends undefined | false
      ? never
      : M[K] extends true | string | object
        ? K
        : never
    : never]?: string;
};

export type StyledConfiguration<C extends ReactComponent, K extends string = string> = Record<
  K,
  | boolean
  | ComponentPropsDotNotation<C>
  | StyledConfigurationObject<C, ComponentPropsDotNotation<C> | false>
>;

interface StyledConfigurationObject<
  C extends ReactComponent,
  T extends ComponentPropsDotNotation<C> | false,
> {
  target: T;
  nativeStyleMapping?: T extends false
    ? NativeStyleMapping<string, ComponentProps<C>>
    : NativeStyleMapping<ResolveDotPath<T, ComponentProps<C>>, ComponentProps<C>>;
  /** @deprecated Please use nativeStyleMapping */
  nativeStyleToProp?: NativeStyleMapping<ResolveDotPath<T, ComponentProps<C>>, ComponentProps<C>>;
}

type NativeStyleMapping<T, S> = T extends object
  ? {
      [K in keyof T as K extends string ? K : never]: true | DotNotation<S>;
    } & {
      fill?: true | DotNotation<S>;
      stroke?: true | DotNotation<S>;
    }
  : Record<string, true | DotNotation<S>>;

export interface StyledOptions {
  passThrough?: boolean;
}

/***************************     React Helpers      ***************************/

export type ComponentPropsDotNotation<C extends ReactComponent> = DotNotation<ComponentProps<C>>;
