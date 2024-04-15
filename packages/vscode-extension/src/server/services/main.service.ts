import { Option } from 'effect';
import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { ConnectionContext } from '../connection/connection.context';
import { LanguageService } from '../language/language.service';

export const startServer = () => {
  return Effect.gen(function* (_) {
    const connection = yield* _(ConnectionContext);
    const service = yield* _(LanguageService);
    connection.onCompletion((params, token, pr, rp) => {
      return service
        .onComPletion(params, token, pr, rp)
        .pipe(Effect.runSync)
        .pipe(Option.getOrElse(() => []));
    });

    connection.listen();
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
