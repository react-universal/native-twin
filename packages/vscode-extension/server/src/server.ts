import { TextDocument } from 'vscode-languageserver-textdocument';
import { createConnection, TextDocuments, ProposedFeatures } from 'vscode-languageserver/node';
import { onCompletion, onCompletionResolve } from './internal/Completions';
import { onConnectionInitialized, onInitializeConnection } from './internal/ConnectionManager';

const connection = createConnection(ProposedFeatures.all);

const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

connection.onInitialize(onInitializeConnection);

connection.onInitialized((params) => onConnectionInitialized(params, connection));

connection.onCompletion(async (position) => onCompletion(position, documents));

connection.onCompletionResolve(onCompletionResolve);

documents.listen(connection);

connection.listen();
