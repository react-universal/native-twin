import { TwinLSPDocument } from '@native-twin/language-service';
import { vscodeLSPAdapterExecutor } from '@native-twin/language-service/adapters/vscode.adapter.js';
import { LSPBaseLayerLive, LSPContext } from '@native-twin/language-service/Services';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as vscode from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LSPConfigLive } from './Config.service';
import { LoggerLive } from './logger.service';
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
  const documentToTwin = (doc: TextDocument) => Option.some(new TwinLSPDocument(doc));

  return LSPContext.of({
    documents,
    getAllDocuments: () => documents.all(),
    getDocument: Option.composeK(getDocument, documentToTwin),
    executor: {
      getLSPDocument: vscodeLSPAdapterExecutor.getLSPDocument,
      getRegionAt: vscodeLSPAdapterExecutor.getRegionAt,
      getRegions: vscodeLSPAdapterExecutor.getRegions,
    },
    connection: connectionHandler,
    documentChanges,
  });
}).pipe(
  Layer.effect(LSPContext)
);

export const LspMainLive = LoggerLive.pipe(
  Layer.provideMerge(TypescriptContextLive),
  Layer.provideMerge(LSPContextLive),
  Layer.provideMerge(LSPBaseLayerLive),
  Layer.provideMerge(LSPConfigLive),
);
