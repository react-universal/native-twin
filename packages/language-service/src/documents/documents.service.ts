import * as Context from 'effect/Context';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type { Connection, TextDocuments } from 'vscode-languageserver';
import type { TextDocument } from 'vscode-languageserver-textdocument';
import { TwinDocument } from './models/twin-document.model';

export interface DocumentsServiceShape {
  handler: TextDocuments<TextDocument>;
  getDocument: (uri: string) => Option.Option<TwinDocument>;
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
  return Layer.succeed(
    DocumentsService,
    DocumentsService.of({
      config,
      handler,
      getDocument(uri): Option.Option<TwinDocument> {
        return pipe(
          Option.fromNullable(this.handler.get(uri)),
          Option.map((x) => new TwinDocument(x, this.config)),
        );
      },
      setupConnection(connection: Connection) {
        this.handler.listen(connection);
      },
    }),
  );
};
