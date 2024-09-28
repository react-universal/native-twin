import { Path } from '@effect/platform';
import { NodeFileSystem, NodePath } from '@effect/platform-node';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import path from 'path';
import { matchCss } from '@native-twin/helpers/server';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { TwinLoggerLive } from './services/Logger.service';
import { makeTwinConfig, MetroConfigService } from './services/MetroConfig.service';
import { getTransformerOptions } from './services/programs/metro.programs';

const FSLive = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, Path.layer);

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const twinConfig = makeTwinConfig(metroConfig, nativeTwinConfig);

  const mainLayer = FSLive.pipe(
    Layer.provideMerge(Layer.succeed(MetroConfigService, twinConfig)),
  ).pipe(Layer.provide(TwinLoggerLive));

  const originalResolver = twinConfig.metroConfig.resolver.resolveRequest;

  return {
    ...twinConfig.metroConfig,
    // transformerPath: require.resolve('./transformer/metro.transformer'),
    resolver: {
      ...twinConfig.metroConfig.resolver,
      sourceExts: [...twinConfig.metroConfig.resolver.sourceExts, '.cjs', '.mjs'],
      resolveRequest(context, moduleName, platform) {
        const resolver = originalResolver ?? context.resolveRequest;
        const resolved = resolver(context, moduleName, platform);

        if (platform === 'web' && 'filePath' in resolved && matchCss(resolved.filePath)) {
          return {
            ...resolved,
            type: 'sourceFile',
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
          Effect.annotateLogs('platform', args[1].platform ?? 'server'),
          Logger.withMinimumLogLevel(LogLevel.All),
          Effect.runPromise,
        );
      },
    },
  } as ComposableIntermediateConfigT;
}
