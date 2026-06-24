import type { CompleteStyle } from '@native-twin/css';
import type {
  ClassicComponentClass,
  ComponentClass,
  ComponentProps,
  ForwardRefExoticComponent,
  FunctionComponent,
} from 'react';
import type { ImageStyle, ViewStyle } from 'react-native';
import type { TextStyle } from '../custom-components/Text/Text.primitive';
import type { DotNotation, ResolveDotPath } from '../styled/dot-notation.types';

export type PropsFrom<TComponent> =
  TComponent extends React.FC<infer Props>
    ? Props
    : TComponent extends React.Component<infer Props>
      ? Props
      : TComponent extends React.ComponentType<infer Props>
        ? Props
        : never;

export type DefaultTheme = {};

export type Primitive = number | (string & {}) | null | undefined | boolean | CompleteStyle;

// export type StyledComponentSheet = ReturnType<typeof createComponentSheet>;

export type StyledSubscription = 'vh' | 'vw' | 'rem' | 'em' | 'appearance';

export type ComponentConfig = {
  target: string;
  source: string;
  nativeStyleToProp?: NativeStyleToProp<any> | undefined;
};

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
    : (keyof P & string) | true;
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

export type ReactComponent<P = any> =
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  | ClassicComponentClass<P>
  | ComponentClass<P>
  | FunctionComponent<P>
  | ForwardRefExoticComponent<P>;

export type ComponentPropsDotNotation<C extends ReactComponent> = DotNotation<ComponentProps<C>>;

/********************************    Styles    ********************************/

export type InlineStyleRecord = Record<string, unknown> & {
  // Used to differentiate between InlineStyleRecord and StyleRule
  s?: never;
};

export type InlineStyle =
  | InlineStyleRecord
  | undefined
  | null
  | (Record<string, unknown> | undefined | null)[]
  | (() => unknown);

/*********************************    Misc    *********************************/

export type Props = Record<string, any> | undefined | null;
export type Callback = () => void;
export type RNStyle = ViewStyle & TextStyle & ImageStyle;
