import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import type { CompilerConfig } from '../babel.types';

export class BuildConfig extends Context.Tag('babel/compiler/config')<
  BuildConfig,
  CompilerConfig
>() {}

export const makeBabelConfig = (input: CompilerConfig) => Layer.succeed(BuildConfig, input);
