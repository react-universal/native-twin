import * as Context from 'effect/Context';
import * as Layer from 'effect/Layer';
import { CompilerInput } from '../babel.types';

export class BabelInput extends Context.Tag('babel/compiler/input')<
  BabelInput,
  CompilerInput
>() {}

export const makeBabelInput = (input: CompilerInput) => Layer.succeed(BabelInput, input);
