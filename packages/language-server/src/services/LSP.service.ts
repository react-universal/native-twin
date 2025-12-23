import {
  BabelLSPAdapterLive,
  LSPBaseLayerLive,
  makeConnectionHandlerCtx,
} from '@native-twin/language-service';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode-languageserver/node';
import { LSPConfigLive } from './Config.service';
import { TypescriptContextLive } from './Typescript.service';

// const documentsHandler = new vscode.TextDocuments(TextDocument);
const connectionHandler = vscode.createConnection();

// const LSPContextLive = Effect.gen(function* () {
//   const documents = documentsHandler;
//   const documentChanges = Stream.async<TextDocument>((emit) => {
//     const subs = documents.onDidChangeContent((doc) => {
//       emit.single(doc.document);
//     });

//     return Effect.sync(() => subs.dispose());
//   });
//   const getDocument = (uri: string) => Option.fromNullable(documents.get(uri));

//   return LSPContext.of({
//     documents,
//     getAllDocuments: () => documents.all(),
//     getDocument: getDocument,
//     connection: connectionHandler,
//     documentChanges,
//   });
// }).pipe(Layer.effect(LSPContext));

export const LspMainLive = Layer.empty.pipe(
  Layer.provideMerge(BabelLSPAdapterLive),
  Layer.provideMerge(TypescriptContextLive),
  Layer.provideMerge(LSPBaseLayerLive),
  makeConnectionHandlerCtx(connectionHandler, true),
  Layer.provideMerge(LSPConfigLive),
);
