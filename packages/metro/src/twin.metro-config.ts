import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import * as Path from '@effect/platform/Path';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import {
  decorateMetroServer,
  getTransformerOptions,
} from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { TwinLoggerLive } from './services/Logger.service';
import { makeTwinConfig, MetroConfigService } from './services/MetroConfig.service';
import { TwinWatcherService } from './services/TwinWatcher.service';

const FSLive = Layer.mergeAll(
  NodeFileSystem.layer,
  NodePath.layer,
  Path.layer,
  TwinWatcherService.Live,
);

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  console.log('METRO_TWIN_CONFIG', nativeTwinConfig);
  const twinConfig = makeTwinConfig(metroConfig, nativeTwinConfig);

  const mainLayer = FSLive.pipe(
    Layer.provideMerge(Layer.succeed(MetroConfigService, twinConfig)),
  )
    .pipe(Layer.provide(TwinLoggerLive))
    .pipe(ManagedRuntime.make);

  // const originalResolver = metroConfig.resolver.resolveRequest;

  const { resolver: metroResolver, server: metroServer } = decorateMetroServer(
    metroConfig,
    twinConfig,
  );

  // const originalGetTransformOptions = metroConfig.transformer.getTransformOptions;

  return {
    ...metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    resolver: {
      ...metroConfig.resolver,
      ...metroResolver,
      // sourceExts: [...metroConfig.resolver.sourceExts],
      // unstable_conditionNames: ['react-native', 'import', 'require'],
      // mainFields: ['react-native', 'module', 'main'],
      // unstable_enablePackageExports: true,
      // unstable_enableSymlinks: true,
    },
    server: {
      ...metroServer,
    },
    transformer: {
      ...metroConfig.transformer,
      ...twinConfig.userConfig,
      // babelTransformerPath: require.xresolve('./transformer/babel.transformer'),
      originalTransformerPath: metroConfig.transformerPath,
      getTransformOptions: (...args) => {
        // return originalGetTransformOptions(...args);
        return getTransformerOptions(twinConfig.userConfig.projectRoot, ...args).pipe(
          Effect.annotateLogs('platform', args[1].platform ?? 'server'),
          Logger.withMinimumLogLevel(LogLevel.All),
          mainLayer.runPromise,
        );
      },
    },
  } as ComposableIntermediateConfigT;
}
