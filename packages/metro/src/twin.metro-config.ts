import { Path } from '@effect/platform';
import { NodeFileSystem, NodePath } from '@effect/platform-node';
import { Console } from 'effect';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';
import { matchCss } from '@native-twin/helpers/build/server';
import { DevToolsLive } from './DevTools';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { makeTwinConfig, MetroConfigService } from './services/MetroConfig.service';
import { getTransformerOptions } from './services/programs/metro.programs';

const FSLive = Layer.mergeAll(
  DevToolsLive,
  NodeFileSystem.layer,
  NodePath.layer,
  Path.layer,
);

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const twinConfig = makeTwinConfig(metroConfig, nativeTwinConfig);

  const mainLayer = FSLive.pipe(
    Layer.provideMerge(Layer.succeed(MetroConfigService, twinConfig)),
  );

  const originalResolver = twinConfig.metroConfig.resolver.resolveRequest;

  return {
    ...twinConfig.metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    resolver: {
      ...twinConfig.metroConfig.resolver,
      resolveRequest(context, moduleName, platform) {
        const resolver = originalResolver ?? context.resolveRequest;
        const resolved = resolver(context, moduleName, platform);

        if (platform === 'web' && 'filePath' in resolved && matchCss(resolved.filePath)) {
          return {
            ...resolved,
            filePath: path.resolve(twinConfig.userConfig.outputCSS),
          };
        }

        return resolved;
      },
    },
    transformer: {
      ...metroConfig.transformer,
      ...twinConfig.userConfig,
      babelTransformerPath: require.resolve('./transformer/babel.transformer'),
      getTransformOptions: (...args) => {
        return getTransformerOptions(...args).pipe(
          Effect.provide(mainLayer),
          Effect.tap((x) => Console.log('resuslts', x)),
          Effect.runPromise,
        );
      },
    },
  } as ComposableIntermediateConfigT;
}
