import { TextDocument } from 'vscode-languageserver-textdocument';
import { ProposedFeatures, createConnection, TextDocuments } from 'vscode-languageserver/node';
import { onCompletionResolver } from './completions';
import {
  onConnectionInitialize,
  onConnectionInitialized,
} from './connection/connection-handler';

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(onConnectionInitialize);
connection.onInitialized(() => onConnectionInitialized(connection));

connection.onCompletion(async (params) => onCompletionResolver(params, documents));

documents.listen(connection);

connection.listen();
