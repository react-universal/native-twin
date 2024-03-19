import {
  ClassicComponentClass,
  ComponentClass,
  ComponentProps,
  ForwardRefExoticComponent,
  FunctionComponent,
  JSXElementConstructor,
} from 'react';
import { CompleteStyle, SheetEntry, SheetEntryDeclaration } from '@native-twin/css';
import { RegisteredComponent } from '@native-twin/styled';
import { Effect, Observable } from '../observable';
import type { createPropState } from './styled-component';

type InteractionState = RegisteredComponent['interactionState'];

export type ComponentInteractionState = {
  [K in keyof InteractionState]: Observable<InteractionState[K]>;
};

export interface ComponentState {
  refs: {
    props: Record<string, any> | null;
    containers: Record<string, ComponentState>;
    variables: Record<string, any>;
  };
  interaction: Partial<ComponentInteractionState>;
  rerender(): void;
  upgrades: {
    animated?: number;
    variables?: number;
    containers?: number;
    pressable?: number;
    canWarn?: boolean;
  };
  propStates: ReturnType<typeof createPropState>[];
}

export type ComponentConfig = {
  target: string;
  source: string;
  nativeStyleToProp?: NativeStyleToProp<any>;
};

export type ReactComponent<P = any> =
  | ClassicComponentClass<P>
  | ComponentClass<P>
  | FunctionComponent<P>
  | ForwardRefExoticComponent<P>;

export type ComponentConfigOptions<
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

export type PropState = ComponentConfig & {
  upgrades: ComponentState['upgrades'];
  refs: ComponentState['refs'];
  interaction: ComponentState['interaction'];
  testID?: string;

  props?: Record<string, any>;

  classNames?: string;
  inlineStyles?: any;

  tracking: {
    inlineStyles?: any;
    index: number;
    rules: SheetEntry[];
    changed: boolean;
  };

  declarations?: SheetEntryDeclaration[];
  importantDeclarations?: SheetEntryDeclaration[];

  variables?: Record<string, any>;
  variableTracking?: Map<string, any>;

  containerNames?: false | string[];
  containerTracking?: Map<string, any>;

  declarationEffect: Effect;
  styleEffect: Effect;
};
