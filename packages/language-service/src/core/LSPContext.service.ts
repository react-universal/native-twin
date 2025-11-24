import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as Option from 'effect/Option';
import type * as Stream from 'effect/Stream';
import type * as server from 'vscode-languageserver';
import type { DocumentUri, TextDocument } from 'vscode-languageserver-textdocument';
import type * as Spec from '../internal/LSPAdapterSpec';
import type { TwinLSPAdapterLayerIn } from '../internal/RunnerLayer';
import type { TwinRuleRegistry } from '../models/TwinParser.models';

export interface LSPTwinCompletionsResult {
  twinTokens: TwinRuleRegistry[];
  region: Spec.AnyTwinNodeRegion | null;
  prevRegion: Option.Option<Spec.AnyTwinNodeRegion>;
  nextRegion: Option.Option<Spec.AnyTwinNodeRegion>;
}

export interface TwinLSPCompletionDefinition {
  name: string;
  apply: <E = never, R = never>(
    filename: string,
    position: Spec.LSPPosition,
  ) => Effect.Effect<
    LSPTwinCompletionsResult,
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
  documents: server.TextDocuments<TextDocument>;
  getDocument: (uri: DocumentUri) => Option.Option<TextDocument>;
  getAllDocuments: () => Array<TextDocument>;
  documentChanges: Stream.Stream<TextDocument>;
}

export const LSPContext = Context.GenericTag<LSPContext>('lsp/MainContext');
