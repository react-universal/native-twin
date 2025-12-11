import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type { AnyLSPError, AnyTwinNodeRegion } from '../models/LSP.models';

export interface LSPParser {
  parseFile(filename: string, code: string): Effect.Effect<AnyTwinNodeRegion[], AnyLSPError>;
  // findRegion(
  //   regions: LSPAdapter.AnyTwinNodeRegion[],
  // ): Effect.Effect<Option.Option<LSPAdapter.JsxAttributeValueRegion>, LSPAdapter.AnyLSPError>;
}

export const LSPParser = Context.GenericTag<LSPParser>('lsp/Parser');
