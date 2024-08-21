import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
// import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
// import * as LogLevel from 'effect/LogLevel';
// import * as Logger from 'effect/Logger';
import * as Option from 'effect/Option';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { isReactImport, isReactRequire } from './effects/path.effects';
import { importProgram } from './effects/programs';
// import { visitJSXElement } from './jsx/jsx.visitors';
import { TransformerContext, CacheLayerLive } from './services';
// import { BabelLogger } from './services/Logger.service';
import { BabelAPI, TwinBabelOptions } from './types/plugin.types';

const program = Effect.scoped(
  Layer.memoize(CacheLayerLive).pipe(
    Effect.andThen((_memoCache) =>
      Effect.gen(function* () {
        const ctx = yield* TransformerContext;
        // const cache = yield* Effect.provide(CacheService, memoCache);
        // yield* Effect.logDebug({ cacheSize: cache.getSize(), babel: true });
        return {
          name: '@native-twin/babel-plugin',
          visitor: {
            MemberExpression(path, state) {
              if (!ctx.isValidFile(state.filename)) return;

              const shouldReplace = importProgram(path).pipe(
                Option.getOrElse(() => false),
              );

              if (shouldReplace) {
                path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
              }
            },
            Identifier(path, state) {
              if (!ctx.isValidFile(state.filename)) return;
              if (
                path.node.name === 'createElement' &&
                path.parentPath.isCallExpression()
              ) {
                const binding = path.scope.getBinding(path.node.name);
                if (!binding) return;
                if (isReactRequire(binding) || isReactImport(binding)) {
                  path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
                }
              }
            },
          },
        } as PluginObj;
      }),
    ),
  ),
);

// const layer = Logger.replace(Logger.defaultLogger, BabelLogger);

export default function nativeTwinBabelPlugin(
  _: BabelAPI,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj {
  return program.pipe(
    // Logger.withMinimumLogLevel(LogLevel.All),
    // Effect.provide(layer),
    Effect.provide(TransformerContext.make(options, cwd)),
    Effect.runSync,
  );
}
