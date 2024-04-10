import { Scope } from 'effect';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { loggerLayer } from '../services/logger.service';
import { ConnectionContext, installConnectionRequestHandler } from './connection.context';
import { getClientCapabilities } from './connection.effects';

export const connectionContextImplementation = Layer.effect(
  ConnectionContext,
  Effect.gen(function* ($) {
    const connection = createConnection(ProposedFeatures.all);

    const scope = yield* $(Scope.make());

    Effect.acquireRelease;

    yield* $(Layer.buildWithScope(loggerLayer(connection), scope));

    yield* $(
      installConnectionRequestHandler(connection.onInitialize, (x) => {
        return getClientCapabilities(x.capabilities).pipe(Effect.runSync);
      }).pipe(Effect.tap(() => Effect.logDebug('Connection Initialize'))),
    );

    return yield* $(Effect.succeed(connection));
  }),
);
export const ConnectionLive = Effect.scoped(
  Layer.memoize(connectionContextImplementation).pipe(
    Effect.flatMap((memoized) =>
      Effect.gen(function* (_) {
        return yield* _(ConnectionContext, Effect.provide(memoized));
      }),
    ),
  ),
);
