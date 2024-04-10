import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import {
  DocumentDiagnosticReportKind,
  DocumentDiagnosticReport,
} from 'vscode-languageserver/node';
import { installConnectionRequestHandler } from '../connection/connection.context';
import { ConnectionLive } from '../connection/connection.provider';
import { DocumentsContextLive } from '../documents/documents.context';
import { validateTextDocument } from '../documents/documents.handlers';

export const MainLive = Effect.gen(function* (_) {
  const connection = yield* _(ConnectionLive);
  const documents = yield* _(DocumentsContextLive);

  yield* _(
    installConnectionRequestHandler(connection.languages.diagnostics.on, (_params) => {
      return {
        kind: DocumentDiagnosticReportKind.Full,
        items: [],
      } satisfies DocumentDiagnosticReport;
    }),
  );

  // The content of a text document has changed. This event is emitted
  // when the text document first opened or when its content has changed.
  documents.onDidChangeContent((change) => {
    validateTextDocument(change.document);
  });

  documents.listen(connection);
  connection.listen();
}).pipe(Logger.withMinimumLogLevel(LogLevel.All));
