import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as Option from 'effect/Option';
import * as VSCDocument from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { TemplateTokenWithText } from '../../template/template.models';
import { NativeTwinPluginConfiguration } from '../../types/extension.types';
import { getDocumentLanguageLocations } from '../utils/document.ast';
import { DocumentLanguageRegion } from './language-region.model';

export class TwinDocument implements Equal.Equal {
  private readonly textDocument: VSCDocument.TextDocument;
  readonly config: NativeTwinPluginConfiguration;

  constructor(document: VSCDocument.TextDocument, config: NativeTwinPluginConfiguration) {
    this.textDocument = document;
    this.config = config;
  }

  get uri() {
    return this.textDocument.uri;
  }

  offsetToPosition(offset: number) {
    return this.textDocument.positionAt(offset);
  }

  positionToOffset(position: vscode.Position) {
    return this.textDocument.offsetAt(position);
  }

  getText(range: vscode.Range | undefined = undefined) {
    return this.textDocument.getText(range);
  }

  getLanguageRegions() {
    return getDocumentLanguageLocations(this.textDocument.getText(), this.config).map(
      (x) => DocumentLanguageRegion.create(this.textDocument, x),
    );
  }

  getTemplateAtPosition(position: vscode.Position) {
    const positionOffset = this.positionToOffset(position);
    return Option.fromNullable(
      this.getLanguageRegions().find(
        (x) => positionOffset >= x.offset.start && positionOffset <= x.offset.end,
      ),
    );
  }

  getRangeAtPosition(
    part: Pick<TemplateTokenWithText, 'loc' | 'text'>,
    templateRange: vscode.Range,
  ) {
    const realStart = this.textDocument.positionAt(
      part.loc.start + templateRange.start.character,
    );
    const realEnd = {
      ...realStart,
      character: realStart.character + part.text.length,
    };
    return vscode.Range.create(realStart, realEnd);
  }

  [Equal.symbol](that: unknown) {
    return (
      that instanceof TwinDocument &&
      that.textDocument.getText() === this.textDocument.getText() &&
      this.textDocument.uri === that.textDocument.uri
    );
  }

  [Hash.symbol](): number {
    return Hash.hash(this.textDocument.getText());
  }
}
