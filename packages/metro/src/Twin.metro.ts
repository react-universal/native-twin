import {
  type NodeWithNativeTwinOptions,
  TwinFSContext,
  TwinNodeContext,
  TwinPath,
  withCompilerLogger,
} from '@native-twin/compiler';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import * as Ref from 'effect/Ref';
import type { GetTransformOptions } from 'metro-config';
import type { CustomResolver } from 'metro-resolver';
import type { TwinMetroConfig } from './models/Metro.models';
import { getMetroSettings } from './programs/getMetroSettings';
import { createMetroInnerLayer, MetroLayerWithTwinWatcher } from './services/Metro.layers';

export function withNativeTwin(
  metroConfig: TwinMetroConfig,
  nativeTwinConfig: NodeWithNativeTwinOptions,
): TwinMetroConfig {
  const MetroLive = createMetroInnerLayer(nativeTwinConfig);
  const runtimeSync = ManagedRuntime.make(MetroLive);

  const runtimeAsync = ManagedRuntime.make(
    MetroLayerWithTwinWatcher.pipe(Layer.provideMerge(MetroLive)),
  );

  const originalResolver = metroConfig.resolver.resolveRequest;
  const originalGetTransformerOptions = metroConfig.transformer.getTransformOptions;

  const metroSettings = runtimeSync.runSync(getMetroSettings);

  return {
    ...metroConfig,
    transformerPath: require.resolve('./programs/metro.transformer'),
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
      const metroSettings = yield* getMetroSettings;
      const resolver = originalResolver ?? context.resolveRequest;
      const resolved = resolver(context, moduleName, platform);
      if (!platform) return resolved;

      const platformOutput = metroSettings.ctx.getOutputCSSPath(platform);
      const platformInput = metroSettings.env.inputCSS;

      if ('filePath' in resolved && resolved.filePath === platformInput) {
        return {
          ...resolved,
          filePath: TwinPath.NodePath.resolve(platformOutput),
        };
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
      // yield* fs.createTwinFiles();

      const platformOutput = ctx.getOutputCSSPath(platform);
      if (!(yield* fs.exists(platformOutput))) {
        yield* fs
          .mkdirCached(TwinPath.absolutePathFromString(TwinPath.NodePath.dirname(platformOutput)))
          .pipe(Effect.tapError(() => Effect.logError('cant create twin output')));
        // yield* fs.writeFileCached({ path: platformOutput });
      }

      yield* Effect.logTrace(`Watcher started for [${options.platform}]`);

      return result;
    }).pipe(
      Effect.annotateLogs('platform', options.platform),
      Effect.withSpan('Transformer', { attributes: { ...options } }),
      Logger.withMinimumLogLevel(metroSettings.env.logLevel),
      withCompilerLogger,
      runtimeAsync.runPromise,
    );
  }
}
