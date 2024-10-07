import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import type * as VSCDocument from 'vscode-languageserver-textdocument';
import type { TemplateTokenWithText } from '../../native-twin/models/template-token.model';
import { getDocumentLanguageLocations } from '../utils/document.ast';
import { DocumentLanguageRegion } from './language-region.model';

export abstract class DocumentClass implements Equal.Equal {
  constructor(
    readonly textDocument: VSCDocument.TextDocument,
    readonly config: { tags: string[]; attributes: string[] },
  ) {}
  abstract offsetToPosition(offset: number): VSCDocument.Position;
  abstract positionToOffset(position: VSCDocument.Position): number;
  abstract getText(range: VSCDocument.Range | undefined): string;

  get uri() {
    return this.textDocument.uri;
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof DocumentClass &&
      this.textDocument.version === that.textDocument.version &&
      this.textDocument.uri === that.textDocument.uri
    );
  }

  [Hash.symbol](): number {
    return Hash.combine(Hash.hash(this.textDocument.uri))(this.textDocument.version);
  }
}

export class TwinDocument extends DocumentClass {
  constructor(
    document: VSCDocument.TextDocument,
    config: { tags: string[]; attributes: string[] },
  ) {
    super(document, config);
  }

  offsetToPosition(offset: number) {
    return this.textDocument.positionAt(offset);
  }

  positionToOffset(position: VSCDocument.Position) {
    return this.textDocument.offsetAt(position);
  }

  getText(range: VSCDocument.Range | undefined = undefined) {
    return this.textDocument.getText(range);
  }

  getLanguageRegions() {
    return getDocumentLanguageLocations(this.getText(undefined), this.config).map((x) =>
      DocumentLanguageRegion.create(this.textDocument, x),
    );
  }

  getTemplateAtPosition(position: VSCDocument.Position) {
    const positionOffset = this.positionToOffset(position);
    return Option.fromNullable(
      this.getLanguageRegions().find(
        (x) => positionOffset >= x.offset.start && positionOffset <= x.offset.end,
      ),
    );
  }

  getRangeAtPosition(
    part: Pick<TemplateTokenWithText, 'loc' | 'text'>,
    templateRange: VSCDocument.Range,
  ): VSCDocument.Range {
    const realStart = this.textDocument.positionAt(
      part.loc.start + templateRange.start.character,
    );
    const realEnd = {
      ...realStart,
      character: realStart.character + part.text.length,
    };
    return {
      start: realStart,
      end: realEnd,
    };
  }
}
