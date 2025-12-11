import * as Data from 'effect/Data';
import type * as t from 'vscode-languageserver-types';

export interface TwinLSPNode<Tag extends string> {
  readonly _tag: Tag;
  range: LSPRange;
  rawText: string;
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
