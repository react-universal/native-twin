import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type ts from 'ts-morph';

// declare module 'typescript' {
//   export function getTokenPosOfNode(
//     node: ts.Node,
//     sourceFile: ts.SourceFileLike,
//     includeJsDoc?: boolean,
//   ): number;
// }

type _TypescriptApi = typeof ts;
export interface TypeScriptApi extends _TypescriptApi {}
export const TypeScriptApi = Context.GenericTag<TypeScriptApi>('TypeScriptApi');

// type _TypeScriptProgram = ts.Program;
export interface TypeScriptProgram {
  getSourceFile: (filename: string, content: string) => Effect.Effect<ts.SourceFile>;
}
export const TypeScriptProgram = Context.GenericTag<TypeScriptProgram>('TypeScriptProgram');
