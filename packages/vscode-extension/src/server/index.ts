import * as Effect from 'effect/Effect';
import { ConnectionLive } from './services/connection.service';
import { DocumentsLive } from './services/documents.service';
import { LoggerLayer } from './services/logger.service';
import { startServer } from './services/main.service';
import { Logger, LogLevel } from 'effect';

startServer().pipe(
  Effect.provide(DocumentsLive),
  Effect.provide(LoggerLayer),
  Effect.provide(ConnectionLive),
  Logger.withMinimumLogLevel(LogLevel.All),
  Effect.runFork,
);
