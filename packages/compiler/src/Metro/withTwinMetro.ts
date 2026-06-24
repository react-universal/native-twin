import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Logger from 'effect/Logger';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Ref from 'effect/Ref';
import type { GetTransformOptions } from 'metro-config';
import type { CustomResolver } from 'metro-resolver';
import { type NodeWithNativeTwinOptions, TwinNodeContext, withCompilerLogger } from '../Config';
import { TwinFSContext } from '../internal/fs';
import * as TwinPath from '../internal/path';
import { getMetroSettings } from './getMetroSettings';
import { createMetroInnerLayer } from './Metro.layers';
import type { TwinMetroConfig } from './Metro.models';

export function withNativeTwin(
  metroConfig: TwinMetroConfig,
  nativeTwinConfig: NodeWithNativeTwinOptions,
): TwinMetroConfig {
  const MetroLive = createMetroInnerLayer(nativeTwinConfig);
  const runtimeSync = ManagedRuntime.make(MetroLive);

  // const runtimeAsync = ManagedRuntime.make(
  //   MetroLayerWithTwinWatcher.pipe(Layer.provideMerge(MetroLive)),
  // );

  const originalResolver = metroConfig.resolver.resolveRequest;
  const originalGetTransformerOptions = metroConfig.transformer.getTransformOptions;

  const metroSettings = runtimeSync.runSync(getMetroSettings);

  return {
    ...metroConfig,
    transformerPath: require.resolve('./Metro.transformer.js'),
    resolver: {
      ...metroConfig.resolver,
      resolveRequest: resolveMetroRequest,
    },
    transformer: {
      ...metroConfig.transformer,
      originalTransformerPath: metroConfig.transformerPath,
      twinConfig: metroSettings.transformerOptions,
      getTransformOptions: getTransformerOptions,
    },
  };

  function resolveMetroRequest(...[context, moduleName, platform]: Parameters<CustomResolver>) {
    return Effect.gen(function* () {
      const resolver = originalResolver ?? context.resolveRequest;
      const resolved = resolver(context, moduleName, platform);

      const metroSettings = yield* getMetroSettings;
      const platformInput = metroSettings.env.inputCSS;

      const platformOutput = metroSettings.ctx.getOutputCSSPath(platform ?? 'native');
      if ('filePath' in resolved && resolved.filePath === platformInput) {
        return { ...resolved, filePath: TwinPath.NodePath.resolve(platformOutput) };
      }

      return resolved;
    }).pipe(runtimeSync.runSync);
  }

  function getTransformerOptions(
    ...[entryPoints, options, getDeps]: Parameters<GetTransformOptions>
  ) {
    return Effect.gen(function* () {
      const result = yield* Effect.promise(() =>
        originalGetTransformerOptions(entryPoints, options, getDeps),
      );

      if (!options.platform) return result;

      const platform = options.platform;
      const fs = yield* TwinFSContext;
      const ctx = yield* TwinNodeContext;
      yield* Ref.update(ctx.state.runningPlatforms.ref, (x) => HashSet.add(x, platform));

      const platformOutput = ctx.getOutputCSSPath(platform);
      if (!(yield* fs.exists(platformOutput))) {
        yield* fs
          .mkdirCached(TwinPath.absolutePathFromString(TwinPath.NodePath.dirname(platformOutput)))
          .pipe(Effect.tapError((x) => Effect.logError('cant create twin output for: ', x)));
        yield* fs.writeFileCached({ path: platformOutput });
      }

      yield* Effect.logTrace(`Watcher started for [${options.platform}]`);

      return result;
    }).pipe(
      Effect.annotateLogs('platform', options.platform),
      Effect.withSpan('Transformer', { attributes: { ...options } }),
      Logger.withMinimumLogLevel(metroSettings.env.logLevel),
      withCompilerLogger,
      Effect.provide(MetroLive),
      Effect.runPromise,
    );
  }
}
