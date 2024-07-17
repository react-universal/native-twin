import type { IntermediateConfigT, TransformerConfigT } from 'metro-config';

export interface CssToReactNativeRuntimeOptions {}

export interface MetroWithNativeWindOptions extends CssToReactNativeRuntimeOptions {
  projectRoot?: string;
  outputDir?: string;
  configPath?: string;
  browserslist?: string | null;
  browserslistEnv?: string | null;
}

export interface MetroConfigInternal {
  projectRoot: string;
  configPath: string;
}

export type ComposableTransformerConfigT = TransformerConfigT & {
  transformerPath?: string;
  // cssToReactNativeRuntime?: CssToReactNativeRuntimeOptions;
} & Record<string, unknown>;

export interface ComposableIntermediateConfigT extends IntermediateConfigT {
  transformer: ComposableTransformerConfigT;
}

export interface TwinServerDataBuffer {
  rem: number;
  version: number;
  data: string | Buffer;
}