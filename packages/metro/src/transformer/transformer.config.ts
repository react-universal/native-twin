import { Context } from 'effect';

export class TransformerConfig extends Context.Tag('babel/TransformerConfig')<
  TransformerConfig,
  {
    cssOutput: string;
    projectRoot: string;
    sourceCode: Buffer;
    isDev: boolean;
    filename: string;
    fileType: string;
    platform: string;
  }
>() {}
