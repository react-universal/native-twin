import type {
  JsTransformerConfig,
  JsTransformOptions,
  TransformResponse,
} from 'metro-transform-worker';

export interface NativeTwinTransformerOpts extends JsTransformerConfig {
  transformerPath?: string;
  allowedFiles: string[];
  tailwindConfigPath: string;
  outputDir: string;
}

export type TwinTransformFn = (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer | string,
  options: JsTransformOptions,
) => Promise<TransformResponse>;

export interface TransformWorkerArgs {
  config: NativeTwinTransformerOpts;
  projectRoot: string;
  filename: string;
  data: Buffer | string;
  options: JsTransformOptions;
}

export interface TwinTransformerOptions {
  src: string;
  filename: string;
  options: {
    projectRoot: string;
    platform: string;
    dev: boolean;
    hot: boolean;
    type: string;
    cache: number;
  };
}
