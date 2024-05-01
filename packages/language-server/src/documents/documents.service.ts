import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as vscode from 'vscode-languageserver/node';
import { ConfigManagerService } from '../connection/client.config';
import { getSourceMatchers } from '../utils/match';
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
  Effect.gen(function* () {
    const handler = new vscode.TextDocuments(TextDocument);
    const configManager = yield* ConfigManagerService;
    const sourceMatchers = getSourceMatchers(ts, configManager.config);
    return {
      handler,
      getDocument(id) {
        return Option.fromNullable(handler.get(id.uri)).pipe(
          Option.map((x) => {
            return new TwinDocument(x, sourceMatchers);
          }),
        );
      },
    };
  }),
);
