import { hash } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Equivalence from 'effect/Equivalence';
import { absurd } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Order from 'effect/Order';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import * as Models from '../models/LSP.models';
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
  getLSPDocument(filename: string): Effect.Effect<LSPTextDocument, Models.AnyLSPError>;
  getRegionAt(
    filename: string,
    position: typeof Models.Position.Type,
  ): Effect.Effect<typeof Models.JSXAttributeValue.Type | null, Models.AnyLSPError>;
  getRegions(
    filename: string,
  ): Effect.Effect<(typeof Models.AnyParsedNode.Type)[], Models.AnyLSPError>;
}

export const LSPAdapterSpec = Context.GenericTag<LSPAdapterSpec>('LSPAdapterSpec');
/**
 * ************* / LSP Parser Adapters *************
 * */

/**
 * ************* LSP identities *************
 * */

const makeLSPUtils = () => {
  const positionOrd = Order.mapInput(Order.number, (a: Models.Position) => a.character);
  const position = (offset: number, line = 0) => Models.Position.from(line ?? 0, offset);

  const isPositionInRange = (range: Models.Range, position: Models.Position) =>
    Order.between(positionOrd)({ maximum: range.end, minimum: range.start })(position);

  const positionEq: Equivalence.Equivalence<Models.Position> = Equivalence.mapInput(
    Equivalence.product(Equivalence.number, Equivalence.number),
    (position: Models.Position) => [position.character, position.line] as const,
  );

  const rangeOrder: Order.Order<Models.Range> = Order.mapInput(
    Order.tuple(positionOrd, positionOrd),
    (range: Models.Range) => [range.start, range.end] as const,
  );

  const range = (start: Models.Position, end: Models.Position): Models.Range =>
    Models.Range.from(start, end);

  const handleError = (error: Models.AnyLSPError['_tag'], cause: unknown) => {
    const errorCause =
      cause instanceof Error
        ? cause
        : typeof cause === 'string'
          ? new Error(cause)
          : new Error(JSON.stringify(cause));

    switch (error) {
      case 'FileNotFound':
        return Models.FileNotFound.create(errorCause);
      case 'LSPParserError':
        return Models.LSPParserError.create(errorCause);
      case 'LSPTokenNotFound':
        return Models.LSPTokenNotFound.create(errorCause);
      default:
        return absurd(error);
    }
  };

  const getPositionID = (position: Models.Position) =>
    hash(`${[position.character, position.line].join('/')}`);

  const getRangeID = (range: Models.Range) => {
    return hash(`${[getPositionID(range.start), getPositionID(range.end)].join('-')}`);
  };

  return {
    getPositionID,
    getRangeID,
    position,
    isPositionInRange,
    positionEq,
    rangeOrder,
    range,
    handleError,
  };
};

export class LSPAdapterUtils extends Effect.Service<LSPAdapterUtils>()('lsp/LSPAdapterUtils', {
  accessors: true,
  sync: makeLSPUtils,
}) {}

const transformJSXAttributes = (attribute: Models.JSXAttribute, doc: TextDocument) => {
  const { value } = attribute;
  const originalText = value.rawText;
  const parsableText = value.text;
  const documentText = doc.getText(
    Models.Range.from(doc.positionAt(value.startOffset), doc.positionAt(value.endOffset)),
  );
  let newStartOffset = value.startOffset;
  // const newEndPosition = { ...value.range.end };
  let newText = value.text;

  const subset = new Set([originalText, parsableText, documentText]);
  if (subset.size === 3) {
    if (value.text.startsWith('`')) {
      newStartOffset += 1;
      newText = newText.slice(1);
    }
    if (value.text.endsWith('`')) {
      newText = newText.slice(0, newText.lastIndexOf('`'));
    }
    return Models.JSXAttribute.make({
      ...attribute,
      name: Models.JSXAttributeName.make(attribute.name),
      rawText: attribute.rawText,
      value: Models.JSXAttributeValue.make({
        ...value,
        startOffset: newStartOffset,
        rawText: value.rawText,
        text: newText,
      }),
    });
  }
  const starOffset = value.startOffset;
  let counterDif = 0;
  let cursor = 0;
  while (cursor < originalText.length) {
    const parsableChar = parsableText[cursor];
    const char = originalText[cursor + counterDif];
    if (!char) break;
    if (char !== parsableChar) {
      ++counterDif;
    }
    ++cursor;
  }
  const cursorDiff = cursor - parsableText.length;
  const finalStartOffset =  starOffset + counterDif - cursorDiff;
  const finalEndOffset = starOffset + parsableText.length + counterDif - cursorDiff;

  return Models.JSXAttribute.make({
    // range: Models.Range.from(attribute.range.start, attribute.range.end),
    ...attribute,
    rawText: attribute.rawText,
    name: Models.JSXAttributeName.make(attribute.name),
    value: Models.JSXAttributeValue.make({
      ...value,
      rawText: value.rawText,
      text: value.text,
      startOffset: finalStartOffset,
      endOffset: finalEndOffset,
    }),
  });
};

export const fixRegionRanges = (node: Models.JSXNode, doc: TextDocument): Models.JSXNode => {
  return Models.JSXNode.make({
    ...node,
    id: node.id,
    text: node.rawText,
    parent: node.parent,
    rawText: node.rawText,
    tag: Models.JSXTagName.make(node.tag),
    attributes: node.attributes.map((x) => transformJSXAttributes(x, doc)),
  });
};
