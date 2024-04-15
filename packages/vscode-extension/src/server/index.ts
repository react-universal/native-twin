import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { LanguageServiceLive } from './language/language.service';
import { ConnectionLive } from './services/connection.service';
import { LoggerLayer } from './services/logger.service';
import { startServer } from './services/main.service';
import { DocumentsServiceLive } from './documents/documents.context';

startServer().pipe(
  Effect.provide(LanguageServiceLive),
  Effect.provide(DocumentsServiceLive),
  Effect.provide(LoggerLayer),
  Effect.provide(ConnectionLive),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.runFork,
);
