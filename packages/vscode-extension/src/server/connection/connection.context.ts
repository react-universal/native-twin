import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import {
  Connection,
  createConnection,
  Disposable,
  DocumentDiagnosticReport,
  DocumentDiagnosticReportKind,
  HandlerResult,
  ProposedFeatures,
  RequestHandler,
  ServerRequestHandler,
} from 'vscode-languageserver/node';

export class ConnectionContext extends Ctx.Tag('ConnectionContext')<
  ConnectionContext,
  Connection
>() {}

export const ConnectionLive = Layer.scoped(
  ConnectionContext,
  Effect.gen(function* ($) {
    const connection = createConnection(ProposedFeatures.all);
    yield* $(Effect.logDebug('Connection Created'));

    // yield* $(
    //   addServerRequestHandler(connection.onInitialize, (params) => {
    //     console.log('PARAMS: ', params);
    //     return getClientCapabilities(params.capabilities).pipe(Effect.runSync);
    //   }),
    // );

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
