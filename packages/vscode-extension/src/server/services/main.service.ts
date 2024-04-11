import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { ConnectionContext } from '../connection/connection.context';

export const startServer = () => {
  return Effect.gen(function* (_) {
    const connection = yield* _(ConnectionContext);

    connection.listen();
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
