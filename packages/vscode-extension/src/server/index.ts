import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { ConnectionLive } from './connection/connection.context';
import { DocumentsServiceLive } from './documents/documents.context';
import { LanguageServiceLive } from './language/language.service';
import { LoggerLayer } from './services/logger.service';
import { startServer } from './services/main.service';
import { TwinContext } from './services/twin.context';

startServer().pipe(
  Effect.provide(LanguageServiceLive),
  Effect.provide(TwinContext.Live),
  Effect.provide(DocumentsServiceLive),
  Effect.provide(LoggerLayer),
  Effect.provide(ConnectionLive),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.runFork,
);
