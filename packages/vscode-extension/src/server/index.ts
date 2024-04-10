import { Logger, LogLevel } from 'effect';
import * as Effect from 'effect/Effect';
import { MainLive } from './services/main.service';

Effect.runFork(
  MainLive.pipe(Logger.withMinimumLogLevel(LogLevel.All))
);
