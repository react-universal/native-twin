import {
  JSXParser,
  LSPConfig,
  LSPConfigService,
  LSPConnectionService,
  TwinLSPDocument,
  TwinParser,
  TwinRuntime,
  TypescriptUtils,
  twinLSPDocumentLayer,
} from '@native-twin/language-service';
import * as Layer from 'effect/Layer';
import * as vscode from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { LoggerLive } from './services/logger.service.js';

const documentsHandler = new vscode.TextDocuments(TextDocument);
const connectionHandler = vscode.createConnection();

export const LspMainLive = LoggerLive.pipe(
  Layer.provideMerge(twinLSPDocumentLayer(documentsHandler, TwinLSPDocument)),
  Layer.provideMerge(LSPConfigService.Live),
  Layer.provideMerge(LSPConnectionService.make(connectionHandler)),
  Layer.provideMerge(JSXParser.JSXParserLive),
  Layer.provideMerge(TwinParser.TwinParserContextLive),
  Layer.provideMerge(TwinRuntime.TwinRuntimeContextLive),
  Layer.provideMerge(TypescriptUtils.TypescriptUtilsLive),
  Layer.provideMerge(Layer.succeed(LSPConfig.TypeScriptPluginConfig, LSPConfig.parsePluginConfig({}))),
);
