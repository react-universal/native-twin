import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as Option from 'effect/Option';
import type * as Stream from 'effect/Stream';
import type * as server from 'vscode-languageserver';
import type * as serverDocs from 'vscode-languageserver-textdocument';
import type * as Spec from '../internal/LSPAdapterSpec';
import type { TwinLSPAdapterLayerIn } from '../internal/RunnerLayer';

export interface TwinLSPCompletionDefinition {
  name: string;
  apply: <E = never, R = never>(
    filename: string,
    position: Spec.LSPPosition,
  ) => Effect.Effect<
    server.HandlerResult<server.CompletionItem[], void>,
    Spec.AnyLSPError | E,
    TwinLSPAdapterLayerIn | Spec.LSPAdapterSpec | R
  >;
}

export function createTwinCompletions(
  definition: TwinLSPCompletionDefinition,
): TwinLSPCompletionDefinition {
  return definition;
}

/***** */

export interface LSPContext {
  connection: server.Connection;
  documents: server.TextDocuments<serverDocs.TextDocument>;
  getDocument: (uri: serverDocs.DocumentUri) => Option.Option<serverDocs.TextDocument>;
  getAllDocuments: () => Array<serverDocs.TextDocument>;
  documentChanges: Stream.Stream<serverDocs.TextDocument>;
}

export const LSPContext = Context.GenericTag<LSPContext>('lsp/MainContext');
