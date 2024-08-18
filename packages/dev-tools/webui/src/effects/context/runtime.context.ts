import { createContext, Context } from 'react';
import type { Layer, ManagedRuntime } from 'effect';

export const createRuntimeContext = <T>(layer: Layer.Layer<T>) => {
  return createContext<
    ManagedRuntime.ManagedRuntime<T, never> | undefined
    // we abuse context here to pass through the layer
  >(layer as unknown as ManagedRuntime.ManagedRuntime<T, never>);
};

export type RuntimeContext<T> = Context<
  ManagedRuntime.ManagedRuntime<T, never> | undefined
>;
