import type { IntermediateConfigT, TransformerConfigT } from 'metro-config';

export type ComposableTransformerConfigT = TransformerConfigT & {
  transformerPath?: string;
  // cssToReactNativeRuntime?: CssToReactNativeRuntimeOptions;
} & Record<string, unknown>;

export interface ComposableIntermediateConfigT extends IntermediateConfigT {
  transformer: ComposableTransformerConfigT;
}
