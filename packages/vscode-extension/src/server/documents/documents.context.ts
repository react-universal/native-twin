import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments } from 'vscode-languageserver/node';

export class DocumentsContext extends Ctx.Tag('DocumentsContext')<
  DocumentsContext,
  TextDocuments<TextDocument>
>() {}

export class DocumentResource extends Ctx.Tag('documents/resources/file')<
  DocumentResource,
  {
    readonly getDocumentSettings: (uri: string, section: string) => Effect.Effect<any>;
    readonly acquireDocument: (uri: string) => Effect.Effect<Option.Option<TextDocument>>;
  }
>() {}
