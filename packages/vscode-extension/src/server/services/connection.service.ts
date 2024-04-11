import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import {
  CompletionItemKind,
  createConnection,
  Disposable,
  DocumentDiagnosticReport,
  DocumentDiagnosticReportKind,
  HandlerResult,
  ProposedFeatures,
  RequestHandler,
  ServerRequestHandler,
} from 'vscode-languageserver/node';
import { ConnectionContext } from '../connection/connection.context';
import { getClientCapabilities } from '../connection/connection.handlers';

export const ConnectionLive = Layer.scoped(
  ConnectionContext,
  Effect.gen(function* ($) {
    const connection = createConnection(ProposedFeatures.all);
    yield* $(Effect.logDebug('Connection Created'));

    yield* $(
      addServerRequestHandler(connection.onInitialize, (params) => {
        return getClientCapabilities(params.capabilities).pipe(Effect.runSync);
      }),
    );

    yield* $(
      addConnectionRequestHandler(connection.onCompletionResolve, (item) => {
        if (item.data === 1) {
          item.detail = 'TypeScript details';
          item.documentation = 'TypeScript documentation';
        } else if (item.data === 2) {
          item.detail = 'JavaScript details';
          item.documentation = 'JavaScript documentation';
        }
        return item;
      }),
    );

    yield* $(
      addServerRequestHandler(connection.onCompletion, () => {
        return [
          {
            label: 'TypeScript',
            kind: CompletionItemKind.Text,
            data: 1,
          },
          {
            label: 'JavaScript',
            kind: CompletionItemKind.Text,
            data: 2,
          },
        ];
      }),
    );

    yield* $(
      addServerRequestHandler(connection.languages.diagnostics.on, (_params) => {
        return {
          kind: DocumentDiagnosticReportKind.Full,
          items: [],
        } satisfies DocumentDiagnosticReport;
      }),
    );
    return ConnectionContext.of(connection);
  }),
);

export const addServerRequestHandler = <Params, Result, Error>(
  event: (handler: ServerRequestHandler<Params, Result, never, Error>) => Disposable,
  handler: ServerRequestHandler<Params, Result, never, Error>,
) => {
  return Effect.sync(() => {
    let result: Option.Option<HandlerResult<Result, Error>> = Option.none();
    return event((...args) => {
      result = Option.fromNullable(handler(...args));
      return result.pipe(Option.getOrThrow);
    });
  });
};

export const addConnectionRequestHandler = <Params, Result, Error>(
  event: (handler: RequestHandler<Params, Result, Error>) => Disposable,
  handler: RequestHandler<Params, Result, Error>,
) => {
  return Effect.sync(() => {
    return event((...args) => {
      return handler(...args);
    });
  });
};
