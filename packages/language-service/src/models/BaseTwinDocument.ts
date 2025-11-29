import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import { Location, Position, Range } from 'vscode-languageserver-types';

export interface TwinBaseDocument {
  getText: (range?: VSCDocument.Range) => string;
  offsetAt: (position: VSCDocument.Position) => number;
  positionAt: (offset: number) => VSCDocument.Position;
}

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

  getDocument() {
    return this.textDocument;
  }

  sumPositions(p1: VSCDocument.Position, p2: VSCDocument.Position) {
    if (p1.line !== p2.line) {
      console.warn('Cant sum positions on different lines');
      return p2;
    }
    return Position.create(p1.line, p1.character + p2.character);
  }

  sumRanges(r1: VSCDocument.Range, r2: VSCDocument.Range) {
    return Range.create(this.sumPositions(r1.start, r2.start), this.sumPositions(r1.end, r2.end));
  }

  getLocation(range: VSCDocument.Range): Location {
    return Location.create(this.uri, range);
  }

  getText(range?: VSCDocument.Range) {
    return this.textDocument.getText(range);
  }

  offsetAt(position: VSCDocument.Position) {
    return this.textDocument.offsetAt(position);
  }

  positionAt(offset: number) {
    return this.textDocument.positionAt(offset);
  }

  isPositionInRange(position: VSCDocument.Position, range: VSCDocument.Range) {
    const rangeStart = this.offsetAt(range.start);
    const rangeEnd = this.offsetAt(range.end);
    const offset = this.offsetAt(position);
    return offset >= rangeStart && offset <= rangeEnd;
  }

  getRangeFor(startOffset: number, endOffset: number): VSCDocument.Range {
    return { start: this.positionAt(startOffset), end: this.positionAt(endOffset) };
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
