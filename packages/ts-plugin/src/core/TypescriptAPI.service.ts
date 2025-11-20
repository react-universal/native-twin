import * as Context from 'effect/Context';
import type ts from 'typescript';

declare module 'typescript' {
  export function getTokenPosOfNode(
    node: ts.Node,
    sourceFile: ts.SourceFileLike,
    includeJsDoc?: boolean,
  ): number;
}

type _TypescriptApi = typeof ts;
export interface TypeScriptApi extends _TypescriptApi {}
export const TypeScriptApi = Context.GenericTag<TypeScriptApi>('TypeScriptApi');

type _TypeScriptProgram = ts.Program;
export interface TypeScriptProgram extends _TypeScriptProgram {}
export const TypeScriptProgram = Context.GenericTag<TypeScriptProgram>('TypeScriptProgram');
