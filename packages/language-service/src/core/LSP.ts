import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type * as Option from 'effect/Option';
import type * as Stream from 'effect/Stream';
import type * as server from 'vscode-languageserver';
import type { DocumentUri, TextDocument } from 'vscode-languageserver-textdocument';
import type { BaseTwinTextDocument } from '../documents/common/BaseTwinDocument';
import type * as Spec from '../internal/LSPAdapterSpec';
import type { TwinLSPAdapterLayerIn } from '../internal/RunnerLayer';
import type { TwinRuleRegistry } from '../models/TwinParser.models';

export interface LSPTwinCompletionsResult {
  twinTokens: TwinRuleRegistry[];
  region: Spec.AnyTwinNodeRegion;
  prevRegion: Option.Option<Spec.AnyTwinNodeRegion>;
  nextRegion: Option.Option<Spec.AnyTwinNodeRegion>;
}

export interface TwinLSPCompletionDefinition {
  name: string;
  // adapter: Spec.LSPAdapterSpec<E, R>;
  apply: <E = never, R = never>(
    filename: string,
    position: Spec.LSPPosition,
    executor: Spec.LSPAdapterSpec<E, R>,
  ) => Effect.Effect<LSPTwinCompletionsResult, Spec.AnyLSPError | E, TwinLSPAdapterLayerIn | R>;
}

export function createTwinCompletions(
  definition: TwinLSPCompletionDefinition,
): TwinLSPCompletionDefinition {
  return definition;
}

/***** */

export interface LSPContext<AddError = never, AddLayer = never> {
  connection: server.Connection;
  adapter: Spec.LSPAdapterSpec<AddError, AddLayer>;
  documents: server.TextDocuments<TextDocument>;
  getDocument: (uri: DocumentUri) => Option.Option<BaseTwinTextDocument>;
  getAllDocuments: () => Array<TextDocument>;
  documentChanges: Stream.Stream<DocumentUri>;
}

export const LSPContext = Context.GenericTag<LSPContext>('lsp/MainContext');
