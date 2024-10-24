import { PluginObj } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import * as Effect from 'effect/Effect';
import { makeBabelLayer, ReactCompilerService } from '@native-twin/compiler/babel';
import { PLUGIN_IMPORT_META } from './constants/plugin.constants';
import { JSXImportPluginContext } from './jsx-import/JSXImport.service';
import { BabelAPI, TwinBabelOptions } from './types/plugin.types';

const program = Effect.scoped(
  Effect.gen(function* () {
    const ctx = yield* JSXImportPluginContext;
    const reactCompiler = yield* ReactCompilerService;
    return {
      name: '@native-twin/babel-plugin',
      visitor: {
        MemberExpression(path, state) {
          if (!ctx.isValidFile(state.filename)) return;

          if (reactCompiler.memberExpressionIsReactImport(path)) {
            path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
          }
        },
        Identifier(path, state) {
          if (!ctx.isValidFile(state.filename)) return;
          if (reactCompiler.identifierIsReactImport(path)) {
            path.replaceWith(addNamed(path, ...PLUGIN_IMPORT_META));
          }
        },
      },
    } as PluginObj;
  }),
);

// const layer = Logger.replace(Logger.defaultLogger, BabelLogger);

function nativeTwinBabelPlugin(
  _: BabelAPI,
  options: TwinBabelOptions,
  cwd: string,
): PluginObj {
  return program.pipe(
    // Logger.withMinimumLogLevel(LogLevel.All),
    // Effect.provide(layer),
    Effect.provide(JSXImportPluginContext.make(options, cwd)),
    Effect.provide(makeBabelLayer),
    Effect.runSync,
  );
}

export default nativeTwinBabelPlugin;
