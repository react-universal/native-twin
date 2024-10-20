import * as Layer from 'effect/Layer';
import type { CompilerInput } from './babel.types';
import { JSXElementNode } from './models';
import { BabelCompiler } from './services/Babel.service';
import { BabelInput, makeBabelInput } from './services/BabelInput.service';
import {
  ReactCompilerService,
  layer as babelReactLayer,
} from './services/ReactBabel.service';

const makeBabelLayer = babelReactLayer.pipe(Layer.provideMerge(BabelCompiler.Live));

export {
  BabelCompiler,
  ReactCompilerService,
  BabelInput,
  JSXElementNode,
  makeBabelLayer,
  makeBabelInput,
};
export type { CompilerInput };
