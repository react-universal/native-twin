import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import type { AnyLSPError, Regions } from '../models/LSP.models';

export interface LSPParser {
  parseFile(
    filename: string,
    code: string,
  ): Effect.Effect<Regions.AnyParsedNode[], AnyLSPError>;
}

export const LSPParser = Context.GenericTag<LSPParser>('lsp/Parser');
