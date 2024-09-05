import { NodeFileSystem, NodePath } from '@effect/platform-node';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';
import { matchCss } from '@native-twin/helpers/build/server';
// import { pipe } from 'effect/Function';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { MetroConfigService } from './services/MetroConfig.service';
import { TwinWatcherService } from './services/TwinWatcher.service';

const program = Effect.gen(function* () {
  const { metroConfig, userConfig } = yield* MetroConfigService;
  const { startFileWatcher } = yield* TwinWatcherService;

  yield* Effect.forkDaemon(startFileWatcher);
  const originalResolver = metroConfig.resolver.resolveRequest;
  return {
    ...metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    resolver: {
      ...metroConfig.resolver,
      resolveRequest(context, moduleName, platform) {
        const resolver = originalResolver ?? context.resolveRequest;
        const resolved = resolver(context, moduleName, platform);

        if (platform === 'web' && 'filePath' in resolved && matchCss(resolved.filePath)) {
          return {
            ...resolved,
            filePath: path.resolve(userConfig.outputCSS),
          };
        }

        return resolved;
      },
    },
    transformer: {
      ...metroConfig.transformer,
      ...userConfig,
      babelTransformerPath: require.resolve('./transformer/babel.transformer'),
      // transformerPath: require.resolve('./transformer/metro.transformer'),
      // getTransformOptions: (...args) =>
      //   pipe(getTransformerOptions(...args), Effect.runPromise),
    },
  } as ComposableIntermediateConfigT;
});

const MainLive = NodeFileSystem.layer.pipe(
  Layer.merge(NodePath.layer),
  Layer.provideMerge(TwinWatcherService.Live),
);

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const layer = MetroConfigService.make(metroConfig, nativeTwinConfig);
  const runnable = Effect.provide(program, layer).pipe(Effect.provide(MainLive));
  return Effect.runSync(runnable);
}
