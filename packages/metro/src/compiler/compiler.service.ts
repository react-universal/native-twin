import { ParseResult } from '@babel/parser';
import * as t from '@babel/types';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import { MetroTransformerContext } from '../transformer/transformer.service';
import {
  createBabelAST,
  getBabelJSXElementChilds,
  visitBabelJSXElementParents,
} from './babel';
import { JSXElementNode } from './models/JSXElement.model';

export class TwinCompilerService extends Context.Tag('compiler/file-state')<
  TwinCompilerService,
  {
    getBabelAST: (code: string, filename: string) => Effect.Effect<ParseResult<t.File>>;
    getBabelParentNodes: (
      from: ParseResult<t.File>,
    ) => Effect.Effect<HashSet.HashSet<JSXElementNode>>;
    getJSXElementChilds: (from: JSXElementNode) => HashSet.HashSet<JSXElementNode>;
  }
>() {}

export const TwinCompilerServiceLive = Layer.scoped(
  TwinCompilerService,
  Effect.gen(function* () {
    const ctx = yield* MetroTransformerContext;

    return {
      getBabelAST: (code) => Effect.sync(() => createBabelAST(code)),
      getBabelParentNodes: (from) =>
        Effect.sync(() => visitBabelJSXElementParents(from, ctx.filename)),
      getJSXElementChilds: (from) => getBabelJSXElementChilds(from.path, from),
    };
  }),
);
