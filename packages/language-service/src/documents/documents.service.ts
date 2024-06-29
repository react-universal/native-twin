import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import type { Connection, TextDocuments } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type * as vscode from 'vscode-languageserver-types';
import { TwinDocument } from './models/twin-document.model';

interface DocumentsServiceShape {
  handler: TextDocuments<TextDocument>;
  getDocument: (uri: vscode.TextDocumentIdentifier) => Option.Option<TwinDocument>;
}
interface DocumentConfig {
  tags: string[];
  attributes: string[];
}

export class DocumentsService implements DocumentsServiceShape {
  readonly handler: TextDocuments<TextDocument>;
  readonly config: DocumentConfig;
  constructor(handler: TextDocuments<TextDocument>, config: DocumentConfig) {
    this.handler = handler;
    this.config = config;
  }

  getDocument(id: vscode.TextDocumentIdentifier): Option.Option<TwinDocument> {
    return pipe(
      Option.fromNullable(this.handler.get(id.uri)),
      Option.map((x) => new TwinDocument(x, this.config)),
    );
  }

  setupConnection(connection: Connection) {
    this.handler.listen(connection);
  }
}
