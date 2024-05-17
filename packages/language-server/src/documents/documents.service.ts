import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { ConfigManagerService } from '../connection/client.config';
import { TwinDocument } from './document.resource';

interface DocumentsServiceShape {
  handler: vscode.TextDocuments<TextDocument>;
  getDocument: (uri: vscode.TextDocumentIdentifier) => Option.Option<TwinDocument>;
  acquireDocument: (uri: string) => Option.Option<TextDocument>;
}

export class DocumentsService extends Ctx.Tag('vscode/DocumentsService')<
  DocumentsService,
  DocumentsServiceShape
>() {
  static Live = Layer.scoped(
    DocumentsService,
    Effect.gen(function* () {
      const handler = new vscode.TextDocuments(TextDocument);
      const configManager = yield* ConfigManagerService;
      return {
        handler,
        acquireDocument(uri) {
          return Option.fromNullable(handler.get(uri));
        },
        getDocument(id) {
          return Option.fromNullable(handler.get(id.uri)).pipe(
            Option.map((x) => {
              return new TwinDocument(x, configManager.config);
            }),
          );
        },
      };
    }),
  );
}
