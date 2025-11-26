import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import type * as Effect from 'effect/Effect';
import * as Equivalence from 'effect/Equivalence';
import * as Layer from 'effect/Layer';
import * as Order from 'effect/Order';
import * as t from 'vscode-languageserver-types';
import type { TwinLSPDocument } from '../models/TwinLSPDocument.model';

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
  return Layer.succeed(LSPAdapterSpec, executor);
};
export interface LSPAdapterSpec {
  getLSPDocument(filename: string): Effect.Effect<LSPTextDocument, AnyLSPError>;
  getRegionAt(
    filename: string,
    offset: LSPPosition,
  ): Effect.Effect<JsxAttributeValueRegion | null, AnyLSPError>;
  getRegions(filename: string): Effect.Effect<AnyTwinNodeRegion[], AnyLSPError>;
  // findRegionAt(
  // regions: AnyTwinNodeRegion[],
  // position: LSPPosition,
  // ): AnyTwinNodeRegion | null
}

export const LSPAdapterSpec = Context.GenericTag<LSPAdapterSpec>('LSPAdapterSpec');
/**
 * ************* / LSP Parser Adapters *************
 * */

/**
 * ************* LSP identities *************
 * */
const positionOrd = Order.mapInput(Order.number, (a: t.Position) => a.character);
export const position = (offset: number, line = 0) => t.Position.create(line ?? 0, offset);

export const isPositionInRange = (range: t.Range, position: t.Position) =>
  Order.between(positionOrd)({ maximum: range.end, minimum: range.start })(position);

export const positionEq: Equivalence.Equivalence<LSPPosition> = Equivalence.mapInput(
  Equivalence.product(Equivalence.number, Equivalence.number),
  (position: LSPPosition) => [position.character, position.line] as const,
);

export const rangeOrder: Order.Order<t.Range> = Order.mapInput(
  Order.tuple(positionOrd, positionOrd),
  (range: t.Range) => [range.start, range.end] as const,
);

export const range = (start: LSPPosition, end: LSPPosition): LSPRange => t.Range.create(start, end);

const createAttributeBinding = (
  input: Omit<JsxAttributeBindingRegion, '_tag'>,
): JsxAttributeBindingRegion => ({
  _tag: 'JsxAttributeBindingRegion',
  ...input,
});

const createJsxAttributeValue = (
  attribute: Omit<JsxAttributeValueRegion, '_tag' | '__parsable'>,
): JsxAttributeValueRegion => {
  const result = {
    ...attribute,
  };

  return {
    __parsable: 'LSPParsableRegion',
    _tag: 'JsxAttributeValueRegion',
    ...result,
  };
};

const createAttributeRegion = (input: Omit<JsxAttributeRegion, '_tag'>): JsxAttributeRegion => ({
  _tag: 'JsxAttributeRegion',
  ...input,
});

const createJsxNode = (input: Omit<JsxNodeRegion, '_tag'>): JsxNodeRegion => ({
  _tag: 'JsxNodeRegion',
  ...input,
});

const createJsxTagName = (input: Omit<JSXNodeTagNameRegion, '_tag'>): JSXNodeTagNameRegion => ({
  _tag: 'JsxTagName',
  ...input,
});

export const TwinLSPNode = {
  createAttributeBinding,
  createJsxAttributeValue,
  createJsxNode,
  createJsxTagName,
  createAttributeRegion,
};

export interface TwinLSPNode<Tag extends string> {
  readonly _tag: Tag;
  range: LSPRange;
  getText: () => string | null;
}

export interface LSPParsableRegion {
  __parsable: 'LSPParsableRegion';
  /** @description this text may have the literal container AKA `|'|" even template literal vars xor expressions */
  rawText: string;
  text: string;
  range: LSPRange;
}
export interface LSPRange {
  start: LSPPosition;
  end: LSPPosition;
}

export interface JsxAttributeBindingRegion extends TwinLSPNode<'JsxAttributeBindingRegion'> {}
export interface JsxAttributeValueRegion
  extends LSPParsableRegion,
    TwinLSPNode<'JsxAttributeValueRegion'> {}

export interface JsxAttributeRegion extends TwinLSPNode<'JsxAttributeRegion'> {
  attributeBinding: JsxAttributeBindingRegion;
  attributeValue: JsxAttributeValueRegion;
}
/**
 * @name JsxNodeRegion
 * @description refers to jsx nodes like <div... /> | <div>...</div>
 * @see This just collect root nodes once wants to work with those needs yo traverse its childs
 * */
export interface JsxNodeRegion extends TwinLSPNode<'JsxNodeRegion'> {
  styledProps: JsxAttributeRegion[];
  tagName: JSXNodeTagNameRegion;
  parent: JsxNodeRegion | null;
}

export interface JSXNodeTagNameRegion extends TwinLSPNode<'JsxTagName'> {}

export type AnyTwinNodeRegion =
  | JsxAttributeRegion
  | JsxNodeRegion
  | JsxAttributeBindingRegion
  | JsxAttributeValueRegion
  | JSXNodeTagNameRegion;

/**
 * ************* / LSP identities *************
 * */

/**
 * ************* LSP Error Models *************
 * */

export interface LSPPosition extends t.Position {}
export interface LSPRange extends t.Range {}

export class FileNotFound extends Data.TaggedError('FileNotFound')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(e: unknown) {
    if (e instanceof Error) return new FileNotFound({ cause: e });
    return new FileNotFound({ cause: new Error(e as string) });
  }
}

export class LSPParserError extends Data.TaggedError('LSPParserError')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(e: unknown) {
    if (e instanceof Error) return new LSPParserError({ cause: e });
    return new LSPParserError({ cause: new Error(e as string) });
  }
}

export class LSPTokenNotFound extends Data.TaggedError('LSPTokenNotFound')<{
  cause: Error;
}> {
  get stackTrace() {
    return this.cause.stack ?? Error.captureStackTrace(this.cause);
  }
  static create(e: unknown) {
    if (e instanceof Error) return new LSPTokenNotFound({ cause: e });
    return new LSPTokenNotFound({ cause: new Error(e as string) });
  }
}

export type AnyLSPError = FileNotFound | LSPParserError | LSPTokenNotFound;

/**
 * ************* / LSP Error Models *************
 * */
