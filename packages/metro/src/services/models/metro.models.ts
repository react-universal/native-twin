import type { JsTransformOptions, TransformResponse } from 'metro-transform-worker';
import type { NativeTwinTransformerOpts } from '@native-twin/babel/models';

export interface TransformWorkerArgs {
  config: NativeTwinTransformerOpts;
  projectRoot: string;
  options: JsTransformOptions;
  cssOutput: string;
  sourceCode: Buffer;
  isDev: boolean;
  filename: string;
  fileType: string;
  platform: string;
}

export interface MetroWorkerInput {
  config: NativeTwinTransformerOpts;
  projectRoot: string;
  filename: string;
  data: Buffer;
  options: JsTransformOptions;
  
}

export type TransformWorkerFn = (
  config: NativeTwinTransformerOpts,
  projectRoot: string,
  filename: string,
  data: Buffer,
  options: JsTransformOptions,
) => Promise<TransformResponse>;
