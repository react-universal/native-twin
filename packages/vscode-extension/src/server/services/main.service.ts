import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import {
  DocumentDiagnosticReport,
  DocumentDiagnosticReportKind,
} from 'vscode-languageserver/node';
import { ConnectionContext } from '../connection/connection.context';
import {
  getClientCapabilities,
  installConnectionRequestHandler,
} from '../connection/connection.effects';

export const startServer = () => {
  return Effect.gen(function* (_) {
    const connection = yield* _(ConnectionContext);

    yield* _(
      installConnectionRequestHandler(connection.languages.diagnostics.on, (_params) => {
        return {
          kind: DocumentDiagnosticReportKind.Full,
          items: [],
        } satisfies DocumentDiagnosticReport;
      }),
    );

    yield* _(
      installConnectionRequestHandler(connection.onInitialize, (x) => {
        return getClientCapabilities(x.capabilities).pipe(Effect.runSync);
      }).pipe(Effect.tap(() => Effect.logDebug('Connection Initialize'))),
    );

    connection.listen();
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
