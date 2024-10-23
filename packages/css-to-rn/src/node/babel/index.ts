import * as Layer from 'effect/Layer';
import type { CompilerConfig } from './babel.types';
import { JSXElementNode } from './models';
import { BabelCompiler } from './services/BabelCompiler.service';
import { BuildConfig, makeBabelConfig } from './services/BuildConfig.service';
import {
  ReactCompilerService,
  layer as babelReactLayer,
} from './services/ReactBabel.service';

const makeBabelLayer = babelReactLayer.pipe(Layer.provideMerge(BabelCompiler.Live));

export {
  BabelCompiler,
  ReactCompilerService,
  BuildConfig,
  JSXElementNode,
  makeBabelLayer,
  makeBabelConfig,
};
export type { CompilerConfig as CompilerInput };
