import type { PluginObj } from '@babel/core';
import {
  type BabelAPI,
  BabelUtils,
  CompilerConfigContext,
  createCompilerConfig,
  type TwinBabelPluginOptions,
  TwinFSContextLive,
  TwinNodeContext,
  TwinNodeContextLive,
  TwinPath,
  TwinProjectContextLive,
  TwinStyleSheetContextLive,
  twinTransformProgram,
} from '@native-twin/compiler';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import path from 'path';

const NodeMainLayerSync = Layer.empty.pipe(
  Layer.provideMerge(BabelUtils.Default),
  Layer.provideMerge(TwinFSContextLive),
  Layer.provideMerge(TwinNodeContextLive),
);

const allowed = new Set<string>();
const visited = new Set<string>();
const program = Effect.scoped(
  Effect.gen(function* () {
    const ctx = yield* TwinNodeContext;
    const babel = yield* BabelUtils;
    const config = yield* CompilerConfigContext;
    return {
      name: '@native-twin/babel-plugin',
      manipulateOptions(opts, parserOpts) {
        if (ctx.isAllowedPath(opts.filename)) {
          // console.log(opts);
          console.log('\n\n');
          console.log('parser_options: ', parserOpts);
          if (opts.plugins) {
            (opts.plugins as (PluginObj & { key: string; options: object })[]).flatMap((x) => {
              if (x.options && Object.keys(x.options).length > 0) {
                return [
                  {
                    name: x.key,
                    options: x.options,
                  },
                ];
              }
              return [];
            });
          }
        }
      },
      pre(file) {
        // const twinFile = new TwinModuleAst({
        //   ast: file as any,
        //   dependencies: [],
        //   jsxElements: file.path.,
        //   file: {
        //     basename: path.dirname(file.ast.loc?.filename ?? this.cwd),
        //     code: file.code,
        //     dirname: path.dirname(file.ast.loc?.filename ?? this.cwd),
        //     path: TwinPath.filePathFromString(file.ast.loc?.filename ?? this.filename ?? this.cwd),
        //   },
        // });
        babel
          .getTwinFileAst({
            id: babel.getAstFileID(file.ast),
            basename: path.dirname(file.ast.loc?.filename ?? this.cwd),
            code: file.code,
            dirname: path.dirname(file.ast.loc?.filename ?? this.cwd),
            path: TwinPath.filePathFromString(file.ast.loc?.filename ?? this.filename ?? this.cwd),
          })
          .pipe(
            Effect.flatMap((x) => {
              return twinTransformProgram(x, 'native').pipe(
                Effect.tap(() =>
                  Effect.sync(() => {
                    file.path.replaceWith(x.ast.program);
                    file.scope.crawl();
                  }),
                ),
              );
            }),
            Effect.provide(TwinProjectContextLive),
            Effect.provide(TwinStyleSheetContextLive),
            Effect.provide(NodeMainLayerSync),
            Effect.provideService(CompilerConfigContext, config),
            Effect.runCallback,
          );
      },
      visitor: {
        Program: {
          enter(_, state) {
            if (state.filename) {
              visited.add(state.filename);

              if (visited.size > 1 && state.filename.endsWith('.tsx')) {
                console.group('LOG_VISITS');
                console.log('VISITED: ', Array.from(visited.values()));
                console.log('ALLOWED: ', allowed.size);
                console.groupEnd();
              }
            }
          },
        },
        // MemberExpression(path, state) {
        //   if (!state.filename || !ctx.isValidFile(state.filename)) return;
        //   if (!allowed.has(state.filename)) {
        //     allowed.add(state.filename);
        //   }
        //   if (reactCompiler.memberExpressionIsReactImport(path)) {
        //     path.replaceWith(addNamed(path, ...BABEL_JSX_PLUGIN_IMPORT_RUNTIME));
        //   }
        // },
        // Identifier(path, state) {
        //   if (!state.filename || !ctx.isValidFile(state.filename)) return;
        //   if (!allowed.has(state.filename)) {
        //     allowed.add(state.filename);
        //   }
        //   if (reactCompiler.identifierIsReactImport(path)) {
        //     path.replaceWith(addNamed(path, ...BABEL_JSX_PLUGIN_IMPORT_RUNTIME));
        //   }
        // },
      },
    } as PluginObj;
  }),
);

function nativeTwinBabelPlugin(
  _: BabelAPI,
  options: TwinBabelPluginOptions,
  cwd: string,
): PluginObj {
  // console.log('OPTIONS: ', options);
  return program.pipe(
    Effect.provide(NodeMainLayerSync),
    Effect.provide(
      Layer.succeed(
        CompilerConfigContext,
        createCompilerConfig({
          outDir: options.outputDir ?? '.',
          rootDir: cwd,
          inputCSS: options.inputCSS,
          twinConfigPath: options.twinConfigPath,
        }),
      ),
    ),
    Effect.runSync,
  );
}

export default nativeTwinBabelPlugin;
