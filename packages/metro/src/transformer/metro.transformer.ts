// import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Option from 'effect/Option';
import { BabelLogger } from '@native-twin/babel/jsx-babel';
import {
  BabelTransformerService,
  BabelTransformerServiceLive,
} from '@native-twin/babel/jsx-babel/services';
import { transformCSS } from './css/css.transform';
import { TransformWorkerFn } from './models/metro.models';
import { makeWorkerLayers, MetroWorkerService } from './services/MetroWorker.service';

const metroMainProgram = Effect.gen(function* () {
  const { runWorker, input, config } = yield* MetroWorkerService;
  BabelTransformerService;

  // const result = yield* runWorker(input);
  if (config.isCSS) {
    const result = yield* transformCSS;
    if (Option.isSome(result)) {
      return result.value;
    }
  }

  return yield* runWorker(input);
});

export const transform: TransformWorkerFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) => {
  const compilerLayer = makeWorkerLayers(config, projectRoot, filename, data, options);

  return pipe(metroRunnable, Effect.provide(compilerLayer), Effect.runPromise);
};

const MainLayer = BabelTransformerServiceLive.pipe(
  Layer.merge(BabelTransformerServiceLive),
  Layer.merge(Logger.replace(Logger.defaultLogger, BabelLogger)),
);

export const metroRunnable = Effect.scoped(
  metroMainProgram.pipe(
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.provide(MainLayer),
  ),
);