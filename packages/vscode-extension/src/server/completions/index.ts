import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  CompletionItem,
  TextDocumentPositionParams,
  TextDocuments,
} from 'vscode-languageserver/node';
import { getTemplateLiteralText } from '../documents/document-utils';

export async function onCompletionResolver(
  params: TextDocumentPositionParams,
  documents: TextDocuments<TextDocument>,
): Promise<CompletionItem[]> {
  const document = documents.get(params.textDocument.uri);
  // const range = { start: { line: params.position.line, character: 0 }, end: params.position };
  // const word = documents.get(params.textDocument.uri)?.getText(range).split(' ').slice(-1)[0];
  getTemplateLiteralText(params, document!);

  return [];
}
