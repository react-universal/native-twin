import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type { Connection, TextDocuments } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import type * as vscode from 'vscode-languageserver-types';
import { TwinDocument } from './models/twin-document.model';

export interface DocumentsServiceShape {
  handler: TextDocuments<TextDocument>;
  getDocument: (uri: vscode.TextDocumentIdentifier) => Option.Option<TwinDocument>;
  config: DocumentConfig;
  setupConnection(connection: Connection): void;
}
export interface DocumentConfig {
  tags: string[];
  attributes: string[];
}

export class DocumentsService extends Context.Tag('language-service/documents')<
  DocumentsService,
  DocumentsServiceShape
>() {}

export const createDocumentsLayer = (
  config: DocumentConfig,
  handler: TextDocuments<TextDocument>,
) => {
  return Layer.scoped(
    DocumentsService,
    Effect.gen(function* () {
      return {
        config,
        handler,
        getDocument(id: vscode.TextDocumentIdentifier): Option.Option<TwinDocument> {
          return pipe(
            Option.fromNullable(this.handler.get(id.uri)),
            Option.map((x) => new TwinDocument(x, this.config)),
          );
        },

        setupConnection(connection: Connection) {
          this.handler.listen(connection);
        },
      };
    }),
  );
};
