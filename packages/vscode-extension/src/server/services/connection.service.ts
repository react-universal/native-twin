import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node';
import { ConnectionContext } from '../connection/connection.context';

export const ConnectionLive = Layer.scoped(
  ConnectionContext,
  Effect.gen(function* ($) {
    const connection = createConnection(ProposedFeatures.all);
    yield* $(Effect.logDebug('Connection Created'));
    return ConnectionContext.of(connection);
  }),
);
