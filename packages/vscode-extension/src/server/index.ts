import * as Effect from 'effect/Effect';
import { ConnectionContext } from './connection/connection.context';

const MainLive = Effect.gen(function* (_) {
  const context = yield* _(ConnectionContext);
  context.connection.console.log('Connection created');
  context.connection.listen();
});

MainLive.pipe(
  Effect.provide(ConnectionContext.Live),
  // as
  Effect.runFork,
);
