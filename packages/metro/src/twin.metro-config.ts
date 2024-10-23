import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import { makeBabelLayer } from '@native-twin/compiler/babel';
import * as TwinMetro from '@native-twin/compiler/metro';

export function withNativeTwin(
  metroConfig: TwinMetro.TwinMetroConfig,
  nativeTwinConfig: TwinMetro.MetroWithNativeTwindOptions = {},
): TwinMetro.TwinMetroConfig {
  console.log('METRO_TWIN_CONFIG', nativeTwinConfig);
  const twinMetroConfig = TwinMetro.createMetroConfig(metroConfig, nativeTwinConfig);

  const mainLayer = TwinMetro.make(twinMetroConfig);

  const runtime = TwinMetro.toRuntime(mainLayer);

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
        return TwinMetro.getTransformerOptions(...args).pipe(
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
