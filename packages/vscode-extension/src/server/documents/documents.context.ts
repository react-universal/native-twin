import * as Ctx from 'effect/Context';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';

export class DocumentsContext extends Ctx.Tag('DocumentsContext')<
  DocumentsContext,
  TextDocuments<TextDocument>
>() {}

