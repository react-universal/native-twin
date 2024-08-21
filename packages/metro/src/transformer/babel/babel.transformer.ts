import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashMap from 'effect/HashMap';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import {
  CacheLayerLive,
  CacheService,
  BabelLogger,
  getJSXElementName,
} from '@native-twin/babel/jsx-babel';
import {
  BabelTransformerContext,
  BabelTransformerService,
  BabelTransformerServiceLive,
  BabelTransformerFn,
  babelTraverseCode,
} from '.';

const mainProgram = (memoCache: Layer.Layer<CacheService, never, never>) =>
  Effect.gen(function* () {
    const ctx = yield* BabelTransformerContext;
    const transformer = yield* BabelTransformerService;
    const cache = yield* Effect.provide(CacheService, memoCache);

    if (transformer.isNotAllowedPath(ctx.filename)) {
      return transformer.transform(ctx.code);
    }

    const compiled = yield* babelTraverseCode({
      code: ctx.code,
      filename: ctx.filename,
      projectRoot: ctx.options.projectRoot,
      cache,
    });
    const cacheSize = cache.getSize();
    if (cacheSize > 0) {
      yield* Effect.logDebug({ cacheSize });

      const fileEntries = pipe(
        cache.getCache(),
        HashMap.values,
        RA.groupBy((node) => node.filename),
        Record.map(
          RA.map((x) => ({
            reactElement: getJSXElementName(x.openingElement).pipe(
              Option.getOrElse(() => 'NoName'),
            ),
            id: x.id,
            root: !x.parent,
            source: x.importSource,
          })),
        ),
      );
      yield* Effect.logDebug({ fileEntries });
    }

    return compiled.generated.code;
  });

const MainLayer = Layer.merge(
  BabelTransformerServiceLive,
  Logger.replace(Logger.defaultLogger, BabelLogger),
);

export const babelRunnable = Effect.scoped(
  Layer.memoize(CacheLayerLive).pipe(
    Effect.andThen(mainProgram),
    Logger.withMinimumLogLevel(LogLevel.All),
    Effect.provide(MainLayer),
  ),
);

export const transform: BabelTransformerFn = async (params) => {
  return babelRunnable
    .pipe(Effect.provide(BabelTransformerContext.make(params)), Effect.runPromise)
    .then((src) => {
      // @ts-expect-error
      return upstreamTransformer.transform({
        src,
        options: params.options,
        filename: params.filename,
      });
    });
};
