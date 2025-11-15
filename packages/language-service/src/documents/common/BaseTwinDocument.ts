import * as Data from 'effect/Data';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import type { TemplateTokenWithText } from '../../models/twin/template-token.model';
import type { NativeTwinPluginConfiguration } from '../../utils/constants.utils';

interface TwinTokenLocation {
  _tag: 'TwinTokenLocation';
  range: VSCDocument.Range;
  offset: {
    start: number;
    end: number;
  };
  text: string;
}

export const TwinTokenLocation = Data.tagged<TwinTokenLocation>('TwinTokenLocation');

export interface TwinBaseDocument {
  getText: (range?: VSCDocument.Range) => string;
  offsetAt: (position: VSCDocument.Position) => number;
  positionAt: (offset: number) => VSCDocument.Position;
  isPositionAtOffset: (bounds: TwinTokenLocation['offset'], offset: number) => boolean;
}

export abstract class BaseTwinTextDocument implements Equal.Equal, TwinBaseDocument {

  constructor(
    private readonly textDocument: VSCDocument.TextDocument,
    readonly config: NativeTwinPluginConfiguration,
  ) {
    this.isPositionAtOffset.bind(this);
  }

  get uri() {
    return this.textDocument.uri;
  }

  get version() {
    return this.textDocument.version;
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

  isPositionAtOffset(bounds: TwinTokenLocation['offset'], offset: number) {
    return offset >= bounds.start && offset <= bounds.end;
  }

  getRangeAtPosition(
    part: Pick<TemplateTokenWithText, 'loc' | 'text'>,
    templateRange: VSCDocument.Range,
  ): VSCDocument.Range {
    const realStart = this.positionAt(part.loc.start + templateRange.start.character);
    const realEnd = {
      ...realStart,
      character: realStart.character + part.text.length,
    };
    return {
      start: realStart,
      end: realEnd,
    };
  }

  // MARK: Equality protocol
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
