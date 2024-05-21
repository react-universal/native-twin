import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as HM from 'effect/MutableHashMap';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { ConfigManagerService } from '../connection/client.config';
import { TwinDocument } from './models/twin-document.model';
import { DocumentCacheKey, getDocumentCacheKey } from './utils/documents.cache';

interface DocumentsServiceShape {
  handler: vscode.TextDocuments<TextDocument>;
  getDocument: (uri: vscode.TextDocumentIdentifier) => Option.Option<TwinDocument>;
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
      const cache = HM.empty<DocumentCacheKey, TwinDocument>();

      const createTwinDocument = (id: vscode.TextDocumentIdentifier) => {
        const getDocument = handler.get(id.uri);
        if (getDocument) {
          pipe(
            cache,
            HM.set(
              getDocumentCacheKey(id.uri),
              new TwinDocument(getDocument, configManager.config),
            ),
          );
        }
        return pipe(cache, HM.get(getDocumentCacheKey(id.uri)));
      };

      const getDocument = (id: vscode.TextDocumentIdentifier) => {
        return cache.pipe(
          HM.get(getDocumentCacheKey(id.uri)),
          Option.match({
            onSome: (x) => Option.some(x),
            onNone: () => createTwinDocument(id),
          }),
        );
      };

      return {
        handler,
        getDocument,
      };
    }),
  );
}
