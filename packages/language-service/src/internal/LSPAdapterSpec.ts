import * as Context from 'effect/Context';
import type * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { AnyLSPError, Position, Regions } from '../models/LSP.models';
import type { TwinLSPDocument } from '../models/TwinLSPDocument.model';
import { annotatedLayer } from '../utils/effect.utils';

export interface LSPTextDocument extends TwinLSPDocument {}
/**
 * ************* LSP Parser adapters *************
 *
 * @description The intention of this is to integrate any kind of parser
 *               due now we got two different implementations (one for babel and another one for the TypeScript compiler)
 * @description Be careful using the Typescript Compiler api as this one is splitted in two implementations (with compiler host and without it)
 * @description The intention for the 2 implementations for TS compiler API its to support language server plugin in DevContainers (deno, vscode or web based editors)
 * */
export const createLSPAdapterExecutor = (executor: LSPAdapterSpec): Layer.Layer<LSPAdapterSpec> => {
  return Layer.succeed(LSPAdapterSpec, executor).pipe(annotatedLayer('LSPAdapterSpec'));
};
export interface LSPAdapterSpec {
  getLSPDocument(filename: string): Effect.Effect<LSPTextDocument, AnyLSPError>;
  getRegionAt(
    filename: string,
    position: typeof Position.Type,
  ): Effect.Effect<Regions.ParsableRegion | null, AnyLSPError>;
  getRegions(filename: string): Effect.Effect<(typeof Regions.AnyParsedNode.Type)[], AnyLSPError>;
}

export const LSPAdapterSpec = Context.GenericTag<LSPAdapterSpec>('LSPAdapterSpec');

/**
 * ************* / LSP Parser Adapters *************
 * */

/**
 * ************* LSP identities *************
 * */
