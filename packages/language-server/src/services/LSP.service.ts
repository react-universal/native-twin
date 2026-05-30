import {
  LanguageServerHandlersLive,
  LSPBaseLayerLive,
  makeConnectionHandlerCtx,
} from '@native-twin/language-service';
import { VscodeLSPAdapterLive } from '@native-twin/language-service/ts-adapter';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode-languageserver/node';
import { LSPConfigLive } from './Config.service';

// const documentsHandler = new vscode.TextDocuments(TextDocument);
const connectionHandler = vscode.createConnection();

export const LspMainLive = Layer.empty.pipe(
  Layer.provideMerge(LanguageServerHandlersLive),
  Layer.provideMerge(VscodeLSPAdapterLive),
  Layer.provideMerge(LSPBaseLayerLive),
  makeConnectionHandlerCtx(connectionHandler, true),
  Layer.provideMerge(LSPConfigLive),
);
