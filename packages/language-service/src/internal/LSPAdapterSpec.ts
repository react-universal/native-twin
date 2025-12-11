import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as Equivalence from 'effect/Equivalence';
import * as Layer from 'effect/Layer';
import * as Order from 'effect/Order';
import * as t from 'vscode-languageserver-types';
import {
  type AnyLSPError,
  type AnyTwinNodeRegion,
  FileNotFound,
  type JSXNodeTagNameRegion,
  type JsxAttributeBindingRegion,
  type JsxAttributeRegion,
  type JsxAttributeValueRegion,
  type JsxNodeRegion,
  LSPParserError,
  type LSPPosition,
  type LSPRange,
  LSPTokenNotFound,
} from '../models/LSP.models';
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
    offset: LSPPosition,
  ): Effect.Effect<JsxAttributeValueRegion | null, AnyLSPError>;
  getRegions(filename: string): Effect.Effect<AnyTwinNodeRegion[], AnyLSPError>;
}

export const LSPAdapterSpec = Context.GenericTag<LSPAdapterSpec>('LSPAdapterSpec');
/**
 * ************* / LSP Parser Adapters *************
 * */

/**
 * ************* LSP identities *************
 * */

const makeLSPUtils = Effect.gen(function* () {
  const positionOrd = Order.mapInput(Order.number, (a: t.Position) => a.character);
  const position = (offset: number, line = 0) => t.Position.create(line ?? 0, offset);

  const isPositionInRange = (range: t.Range, position: t.Position) =>
    Order.between(positionOrd)({ maximum: range.end, minimum: range.start })(position);

  const positionEq: Equivalence.Equivalence<LSPPosition> = Equivalence.mapInput(
    Equivalence.product(Equivalence.number, Equivalence.number),
    (position: LSPPosition) => [position.character, position.line] as const,
  );

  const rangeOrder: Order.Order<t.Range> = Order.mapInput(
    Order.tuple(positionOrd, positionOrd),
    (range: t.Range) => [range.start, range.end] as const,
  );

  const range = (start: LSPPosition, end: LSPPosition): LSPRange => t.Range.create(start, end);

  const createAttributeBinding = (
    input: Omit<JsxAttributeBindingRegion, '_tag'>,
  ): JsxAttributeBindingRegion =>
    Data.struct({
      _tag: 'JsxAttributeBindingRegion',
      ...input,
    });

  const createJsxAttributeValue = (
    attribute: Omit<JsxAttributeValueRegion, '_tag' | '__parsable'>,
  ): JsxAttributeValueRegion => {
    return Data.struct({
      __parsable: 'LSPParsableRegion',
      _tag: 'JsxAttributeValueRegion',
      ...attribute,
    });
  };

  const createAttributeRegion = (input: Omit<JsxAttributeRegion, '_tag'>): JsxAttributeRegion =>
    Data.struct({
      _tag: 'JsxAttributeRegion',
      ...input,
    });

  const createJsxNode = (input: Omit<JsxNodeRegion, '_tag'>): JsxNodeRegion =>
    Data.struct({
      _tag: 'JsxNodeRegion',
      ...input,
    });

  const createJsxTagName = (input: Omit<JSXNodeTagNameRegion, '_tag'>): JSXNodeTagNameRegion =>
    Data.struct({
      _tag: 'JsxTagName',
      ...input,
    });

  const handleError = (error: AnyLSPError['_tag'], cause: unknown) => {
    const errorCause =
      cause instanceof Error
        ? cause
        : typeof cause === 'string'
          ? new Error(cause)
          : new Error(JSON.stringify(cause));

    switch (error) {
      case 'FileNotFound':
        return FileNotFound.create(errorCause);
      case 'LSPParserError':
        return LSPParserError.create(errorCause);
      case 'LSPTokenNotFound':
        return LSPTokenNotFound.create(errorCause);
    }
  };

  return {
    createAttributeBinding,
    createAttributeRegion,
    createJsxAttributeValue,
    createJsxNode,
    createJsxTagName,
    position,
    isPositionInRange,
    positionEq,
    rangeOrder,
    range,
    handleError,
  };
});

export class LSPAdapterUtils extends Effect.Service<LSPAdapterUtils>()('lsp/LSPAdapterUtils', {
  accessors: true,
  effect: makeLSPUtils,
}) {}
