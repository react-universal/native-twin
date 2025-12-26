import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import { Location, Position, Range, Regions } from './LSP.models';
import type { ParsedRuleWithLocation } from './TwinParser.models';

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

  getLocation(range: Range): Location {
    return Location.from(this.uri, range);
  }

  getText(range?: Range) {
    return this.textDocument.getText(range);
  }

  offsetAt(position: Position) {
    return this.textDocument.offsetAt(position);
  }

  positionAt(offset: number) {
    return Position.make(this.textDocument.positionAt(offset));
  }

  isPositionInRange(position: Position, range: Range) {
    const rangeStart = this.offsetAt(range.start);
    const rangeEnd = this.offsetAt(range.end);
    const offset = this.offsetAt(position);
    return offset >= rangeStart && offset <= rangeEnd;
  }

  getRangeFor(startOffset: number, endOffset: number): Range {
    return Range.from(this.positionAt(startOffset), this.positionAt(endOffset));
  }

  locationAtOffsets(start: number, end: number): Location {
    return this.getLocation(this.getRangeFor(start, end));
  }

  getParsedRegionRange(region: ParsedRuleWithLocation) {
    return this.locationAtOffsets(region.startOffset, region.endOffset);
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
  readonly regions: Regions.JSXNode[];
  readonly parsableRegions: {
    region: Regions.AnyParsedNode;
    data: Regions.ParsableRegion;
  }[];

  constructor(textDocument: VSCDocument.TextDocument, regions: Regions.JSXNode[]) {
    super(textDocument);
    this.regions = regions.map((x) => fixRegionRanges(x, textDocument));
    this.parsableRegions = this.regions.flatMap((region) =>
      region.attributes
        .map((x) => x.value)
        .map((attr) => ({ region, data: Regions.ParsableRegion.JSXAttribute({ value: attr }) })),
    );
  }

  getNodeRange(node: Regions.AnyParsedNode) {
    return Range.from(this.positionAt(node.startOffset), this.positionAt(node.endOffset));
  }

  findRegionAt(position: Position): Regions.ParsableRegion | null {
    return (
      this.parsableRegions.find((x) =>
        this.isPositionInRange(position, this.getNodeRange(x.data.value)),
      )?.data ?? null
    );
  }
}

export interface TwinBaseDocument {
  getText: (range?: Range) => string;
  offsetAt: (position: Position) => number;
  positionAt: (offset: number) => Position;
}

const transformJSXAttributes = (attribute: Regions.JSXAttribute, doc: VSCDocument.TextDocument) => {
  const { value } = attribute;
  const originalText = value.rawText;
  const parsableText = value.text;
  const documentText = doc.getText(
    Range.from(doc.positionAt(value.startOffset), doc.positionAt(value.endOffset)),
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
    return Regions.JSXAttribute.make({
      ...attribute,
      name: Regions.JSXAttributeName.make(attribute.name),
      rawText: attribute.rawText,
      value: Regions.JSXAttributeValue.make({
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

  return Regions.JSXAttribute.make({
    // range: Range.from(attribute.range.start, attribute.range.end),
    ...attribute,
    rawText: attribute.rawText,
    name: Regions.JSXAttributeName.make(attribute.name),
    value: Regions.JSXAttributeValue.make({
      ...value,
      rawText: value.rawText,
      text: value.text,
      startOffset: finalStartOffset,
      endOffset: finalEndOffset,
    }),
  });
};

const fixRegionRanges = (node: Regions.JSXNode, doc: VSCDocument.TextDocument): Regions.JSXNode => {
  return Regions.JSXNode.make({
    ...node,
    id: node.id,
    text: node.rawText,
    parent: node.parent,
    rawText: node.rawText,
    tag: Regions.JSXTagName.make(node.tag),
    attributes: node.attributes.map((x) => transformJSXAttributes(x, doc)),
  });
};
