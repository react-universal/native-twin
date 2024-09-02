import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import { startScanning } from './cli/TwinFileSystem';
import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { MetroConfigService } from './services/MetroConfig.service';

const program = Effect.gen(function* () {
  const { metroConfig, getTransformerOptions, userConfig } = yield* MetroConfigService;
  const { resolver } = decorateMetroServer(metroConfig, userConfig);

  yield* Effect.forkDaemon(startScanning);
  return {
    ...metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    // server,
    resolver,
    transformer: {
      ...metroConfig.transformer,
      ...userConfig,
      babelTransformerPath: require.resolve('./transformer/babel.transformer'),
      getTransformOptions: (...args) =>
        pipe(getTransformerOptions(...args), Effect.runPromise),
    },
  } as ComposableIntermediateConfigT;
});
export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const layer = MetroConfigService.make(metroConfig, nativeTwinConfig);
  const runnable = Effect.provide(program, layer);
  return Effect.runSync(runnable);
}
