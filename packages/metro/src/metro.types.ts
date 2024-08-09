import type { IntermediateConfigT, TransformerConfigT } from 'metro-config';

export interface CssToReactNativeRuntimeOptions {}

/** @domain NativeTwin config options */
export interface MetroWithNativeTwindOptions extends CssToReactNativeRuntimeOptions {
  projectRoot?: string;
  outputDir?: string;
  configPath?: string;
  browserslist?: string | null;
  browserslistEnv?: string | null;
}

/** @domain MetroResolver */
export interface MetroConfigInternal {
  projectRoot: string;
  configPath: string;
}

type ComposableTransformerConfigT = TransformerConfigT & {
  transformerPath?: string;
} & Record<string, unknown>;

/** @domain Metro config options */
export interface ComposableIntermediateConfigT extends IntermediateConfigT {
  transformer: ComposableTransformerConfigT;
}

/** @domain Metro server decorator */
export interface TwinServerDataBuffer {
  version: number;
  data: string | Buffer;
}

/** @domain DocumentService  */
export interface TwinFileHandlerArgs {
  projectRoot: string;
  filename: string;
  data: Buffer | string;
  type: string;
  platform: string;
}

export interface MetroContextConfig extends MetroConfigInternal {
  dev: boolean;
  hot: boolean;
  outputDir: string;
  twinCacheFile: string;
}
