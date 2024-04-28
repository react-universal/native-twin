import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Layer from 'effect/Layer';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { ConnectionService } from '../connection/connection.service';
import { TwinDocument } from './document.resource';

interface DocumentsServiceShape {
  handler: vscode.TextDocuments<TextDocument>;
  getDocument: (uri: vscode.TextDocumentIdentifier) => Option.Option<TwinDocument>;
}

export class DocumentsService extends Ctx.Tag('vscode/DocumentsService')<
  DocumentsService,
  DocumentsServiceShape
>() {}

export const DocumentsServiceLive = Layer.scoped(
  DocumentsService,
  Effect.gen(function* ($) {
    const connectionRef = yield* $(ConnectionService);
    const connection = yield* $(connectionRef.connectionRef.get);
    const handler = new vscode.TextDocuments(TextDocument);

    handler.listen(connection);

    return {
      handler,
      getDocument(id) {
        return Option.fromNullable(handler.get(id.uri)).pipe(
          Option.map((x) => new TwinDocument(x)),
        );
      },
    };
  }),
);
