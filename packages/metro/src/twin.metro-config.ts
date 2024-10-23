import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import {
  createMetroConfig,
  MetroWithNativeTwindOptions,
  TwinMetroConfig,
  makeMetroLayer,
  metroLayerToRuntime,
  getTransformerOptions,
  makeBabelLayer,
} from '@native-twin/compiler/node';

export function withNativeTwin(
  metroConfig: TwinMetroConfig,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): TwinMetroConfig {
  const twinMetroConfig = createMetroConfig(metroConfig, nativeTwinConfig);

  const mainLayer = makeMetroLayer(twinMetroConfig);

  const runtime = metroLayerToRuntime(mainLayer);

  // const originalResolver = metroConfig.resolver.resolveRequest;

  // const originalGetTransformOptions = metroConfig.transformer.getTransformOptions;
  return {
    ...twinMetroConfig.metroConfig,
    transformerPath: require.resolve('@native-twin/compiler/metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      ...twinMetroConfig.metroConfig.transformer,
      ...twinMetroConfig.userConfig,
      // babelTransformerPath: require.resolve('@native-twin/compiler/metro.babel.transformer'),
      originalTransformerPath: metroConfig.transformerPath,
      unstable_allowRequireContext: true,
      getTransformOptions: (...args) => {
        // return originalGetTransformOptions(...args);
        return getTransformerOptions(...args).pipe(
          Effect.provide(mainLayer),
          Effect.provide(makeBabelLayer),
          Effect.annotateLogs('platform', args[1].platform ?? 'server'),
          Logger.withMinimumLogLevel(LogLevel.All),
          runtime.runPromise,
        );
      },
    },
  };
}
