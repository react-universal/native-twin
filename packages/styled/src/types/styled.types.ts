import type { CompleteStyle } from '@native-twin/css';
import type {
  ClassicComponentClass,
  ComponentClass,
  ComponentProps,
  ForwardRefExoticComponent,
  FunctionComponent,
  JSXElementConstructor,
} from 'react';

export type PropsFrom<TComponent> = TComponent extends React.FC<infer Props>
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
  nativeStyleToProp?: NativeStyleToProp<any>;
};

/** Used */
export type ReactComponent<P = any> =
  | ClassicComponentClass<P>
  | ComponentClass<P>
  | FunctionComponent<P>
  | ForwardRefExoticComponent<P>;

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
    : (keyof P & string) | true;
};
