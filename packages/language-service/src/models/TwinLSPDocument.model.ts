import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import * as LSP from './LSP.models';
export abstract class BaseTwinTextDocument implements Equal.Equal, TwinBaseDocument {
  constructor(private readonly textDocument: VSCDocument.TextDocument) {}

  get document() {
    return this.textDocument;
  }

  get uri() {
    return this.textDocument.uri;
  }

  get version() {
    return this.textDocument.version;
  }

  sumPositions(p1: LSP.Position, p2: LSP.Position) {
    if (p1.line !== p2.line) {
      console.warn('Cant sum positions on different lines');
      return LSP.Position.make(p2);
    }
    return LSP.Position.sum(p1, p2);
  }

  sumRanges(r1: LSP.Range, r2: LSP.Range) {
    return LSP.Range.sum(r1, r2);
  }

  getLocation(range: LSP.Range): LSP.Location {
    return LSP.Location.from(this.uri, range);
  }

  getText(range?: LSP.Range) {
    return this.textDocument.getText(range);
  }

  offsetAt(position: LSP.Position) {
    return this.textDocument.offsetAt(position);
  }

  positionAt(offset: number) {
    return LSP.Position.make(this.textDocument.positionAt(offset));
  }

  isPositionInRange(position: LSP.Position, range: LSP.Range) {
    const rangeStart = this.offsetAt(range.start);
    const rangeEnd = this.offsetAt(range.end);
    const offset = this.offsetAt(position);
    return offset >= rangeStart && offset <= rangeEnd;
  }

  getRangeFor(startOffset: number, endOffset: number): LSP.Range {
    return LSP.Range.from(this.positionAt(startOffset), this.positionAt(endOffset));
  }

  locationAtOffsets(start: number, end: number) {
    return this.getLocation(this.getRangeFor(start, end));
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof BaseTwinTextDocument &&
      this.textDocument.version === that.textDocument.version &&
      this.textDocument.uri === that.textDocument.uri
    );
  }

  [Hash.symbol](): number {
    return Hash.combine(Hash.hash(this.textDocument.uri))(this.textDocument.version);
  }
}

export class LSPBasicDocument extends BaseTwinTextDocument {
  constructor(document: VSCDocument.TextDocument) {
    super(document);
  }
}

export class TwinLSPDocument extends BaseTwinTextDocument {
  readonly regions: LSP.JSXNode[];
  readonly parsableRegions: {
    region: LSP.JSXNode;
    attr: LSP.JSXAttributeValue;
  }[];

  constructor(textDocument: VSCDocument.TextDocument, regions: LSP.JSXNode[]) {
    super(textDocument);
    this.regions = regions.map((x) => fixRegionRanges(x, textDocument));
    this.parsableRegions = this.regions.flatMap((region) =>
      region.attributes.map((x) => x.value).map((attr) => ({ region, attr })),
    );
  }

  getNodeRange(node: LSP.AnyParsedNode['Type']) {
    return LSP.Range.from(this.positionAt(node.startOffset), this.positionAt(node.endOffset));
  }

  findRegionAt(position: LSP.Position): LSP.JSXAttributeValue | null {
    return (
      this.parsableRegions.find((x) => this.isPositionInRange(position, this.getNodeRange(x.attr)))
        ?.attr ?? null
    );
  }
}

export interface TwinBaseDocument {
  getText: (range?: LSP.Range) => string;
  offsetAt: (position: LSP.Position) => number;
  positionAt: (offset: number) => LSP.Position;
}

const transformJSXAttributes = (attribute: LSP.JSXAttribute, doc: VSCDocument.TextDocument) => {
  const { value } = attribute;
  const originalText = value.rawText;
  const parsableText = value.text;
  const documentText = doc.getText(
    LSP.Range.from(
      LSP.Position.make(doc.positionAt(value.startOffset)),
      LSP.Position.make(doc.positionAt(value.endOffset)),
    ),
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
    return LSP.JSXAttribute.make({
      ...attribute,
      name: LSP.JSXAttributeName.make(attribute.name),
      rawText: attribute.rawText,
      value: LSP.JSXAttributeValue.make({
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
  const finalStartOffset = starOffset + counterDif - cursorDiff;
  const finalEndOffset = starOffset + parsableText.length + counterDif - cursorDiff;

  return LSP.JSXAttribute.make({
    // range: LSP.Range.from(attribute.range.start, attribute.range.end),
    ...attribute,
    rawText: attribute.rawText,
    name: LSP.JSXAttributeName.make(attribute.name),
    value: LSP.JSXAttributeValue.make({
      ...value,
      rawText: value.rawText,
      text: value.text,
      startOffset: finalStartOffset,
      endOffset: finalEndOffset,
    }),
  });
};

const fixRegionRanges = (node: LSP.JSXNode, doc: VSCDocument.TextDocument): LSP.JSXNode => {
  return LSP.JSXNode.make({
    ...node,
    id: node.id,
    text: node.rawText,
    parent: node.parent,
    rawText: node.rawText,
    tag: LSP.JSXTagName.make(node.tag),
    attributes: node.attributes.map((x) => transformJSXAttributes(x, doc)),
  });
};
