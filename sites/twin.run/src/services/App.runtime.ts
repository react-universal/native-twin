import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { AppWorkersLive } from './AppWorkers.service';
import { MonacoContextLive } from './Monaco.service';

const loggerLayer = Logger.replace(
  Logger.defaultLogger,
  Logger.prettyLogger({
    colors: true,
    mode: 'browser',
  }),
);

export const MainLayer = Layer.empty.pipe(
  Layer.provideMerge(AppWorkersLive),
  Layer.provideMerge(MonacoContextLive),
  Layer.provide(loggerLayer),
);

export const MonacoRuntime = ManagedRuntime.make(MainLayer);
