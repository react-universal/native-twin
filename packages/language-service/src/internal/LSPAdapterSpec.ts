import * as Data from 'effect/Data';
import type * as Effect from 'effect/Effect';
import * as Equivalence from 'effect/Equivalence';
import type * as Option from 'effect/Option';
import * as Order from 'effect/Order';
import * as t from 'vscode-languageserver-types';
import type { BaseTwinTextDocument } from '../documents/common/BaseTwinDocument';
import type { TwinLSPAdapterLayerIn } from './RunnerLayer';

export interface LSPTextDocument {
  document: BaseTwinTextDocument;
  getText: (range?: LSPRange) => string;
  getOffsetAt: (position: LSPPosition) => number;
  getPositionAt: (offset: number) => LSPPosition;
  // getFileSource: (filename: string) => Effect.Effect<ts.SourceFile>;
  // toPosition: <A extends object>(unknownPos: A) => LSPPosition;
  // toRange: <A extends object>(unknownPos: A | LSPRange) => LSPRange;
}
/**
 * ************* LSP Parser adapters *************
 *
 * @description The intention of this is to integrate any kind of parser
 *               due now we got two different implementations (one for babel and another one for the TypeScript compiler)
 * @description Be careful using the Typescript Compiler api as this one is splitted in two implementations (with compiler host and without it)
 * @description The intention for the 2 implementations for TS compiler API its to support language server plugin in DevContainers (deno, vscode or web based editors)
 * */
export const createLSPAdapterExecutor = <E = never, R = never>(
  executor: LSPAdapterSpec<E, R>,
): LSPAdapterSpec<E, R> => {
  return executor;
};
export interface LSPAdapterSpec<AddError = never, AddLayer = never> {
  getLSPDocument: <R = never>(
    filename: string,
  ) => Effect.Effect<LSPTextDocument, AnyLSPError | AddError, AddLayer | R>;
  getRegionAt: <R = never>(
    filename: string,
    offset: LSPPosition,
  ) => Effect.Effect<
    Option.Option<AnyTwinNodeRegion>,
    AnyLSPError | AddError,
    TwinLSPAdapterLayerIn | AddLayer | R
  >;
  getRegions<R = never>(
    filename: string,
  ): Effect.Effect<
    AnyTwinNodeRegion[],
    AnyLSPError | AddError,
    TwinLSPAdapterLayerIn | AddLayer | R
  >;
}
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
  attribute: Omit<JsxAttributeValueRegion, '_tag'>,
): JsxAttributeValueRegion => ({
  _tag: 'JsxAttributeValueRegion',
  ...attribute,
});

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

export interface LSPRange {
  start: LSPPosition;
  end: LSPPosition;
}

export interface JsxAttributeBindingRegion extends TwinLSPNode<'JsxAttributeBindingRegion'> {}
export interface JsxAttributeValueRegion extends TwinLSPNode<'JsxAttributeValueRegion'> {}

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

export class LSPTypescriptFailure extends Data.TaggedError('LSPTypescriptFailure')<{
  info: unknown;
}> {}

export type AnyLSPError = FileNotFound | LSPParserError | LSPTokenNotFound;

/**
 * ************* / LSP Error Models *************
 * */
