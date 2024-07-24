import * as Context from 'effect/Context';
import type { TransformWorkerArgs } from '../types/transformer.types';

export class TransformerConfig extends Context.Tag('babel/TransformerConfig')<
  TransformerConfig,
  {
    workerArgs: TransformWorkerArgs;
    cssOutput: string;
    projectRoot: string;
    sourceCode: Buffer;
    isDev: boolean;
    filename: string;
    fileType: string;
    platform: string;
  }
>() {}
