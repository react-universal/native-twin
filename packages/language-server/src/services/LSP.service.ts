import { LSPBaseLayerLive, LSPContext } from '@native-twin/language-service';
import { VscodeLSPAdapterLive } from '@native-twin/language-service/vscode-server';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as vscode from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPConfigLive } from './Config.service';
import { TypescriptContextLive } from './Typescript.service';

const documentsHandler = new vscode.TextDocuments(TextDocument);
const connectionHandler = vscode.createConnection();

const LSPContextLive = Effect.gen(function* () {
  const documents = documentsHandler;
  const documentChanges = Stream.async<TextDocument>((emit) => {
    const subs = documents.onDidChangeContent((doc) => {
      emit.single(doc.document);
    });

    return Effect.sync(() => subs.dispose());
  });
  const getDocument = (uri: string) => Option.fromNullable(documents.get(uri));
  // const documentToTwin = (doc: TextDocument) => Option.some(new TwinLSPDocument(doc));

  return LSPContext.of({
    documents,
    getAllDocuments: () => documents.all(),
    getDocument: getDocument,
    connection: connectionHandler,
    documentChanges,
  });
}).pipe(Layer.effect(LSPContext));

// const TwinLogger = Logger.replace(Logger.defaultLogger, createLspLogger('LSP'));

export const LspMainLive = Layer.empty.pipe(
  Layer.provideMerge(VscodeLSPAdapterLive),
  Layer.provideMerge(TypescriptContextLive),
  Layer.provideMerge(LSPBaseLayerLive),
  Layer.provideMerge(LSPContextLive),
  Layer.provideMerge(LSPConfigLive),
);
