/** @effect-diagnostics multipleEffectProvide:skip-file */
import * as path from 'node:path';
import { unstable_transformerPath } from '@expo/metro-config';
import { matchCss } from '@native-twin/helpers/server';
import * as Effect from 'effect/Effect';
import * as Logger from 'effect/Logger';
import * as LogLevel from 'effect/LogLevel';
import type { TransformResponse } from 'metro-transform-worker';
import { TwinNodeContext } from '../Config';
import { twinTransformProgram } from '../Programs/twinTransform.program';
import { TwinProjectContext, TwinProjectContextLive } from '../Project';
import { transformCSSExpo } from './css.transform';
import type { TwinMetroTransformFn } from './Metro.models';

const worker = require(unstable_transformerPath) as typeof import('metro-transform-worker');
type MetroTransformFn = typeof worker.transform;

const MainLayer = TwinProjectContextLive;

export const transform: TwinMetroTransformFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) =>
  Effect.gen(function* () {
    const twinConfig = config.twinConfig;
    // yield* Effect.log(inspect(twinConfig, false, null, true));
    const platform = options.platform ?? 'native';
    const { getAst } = yield* TwinProjectContext;
    const ctx = yield* TwinNodeContext;

    const platformOutput = ctx.getOutputCSSPath(platform);

    const transform: MetroTransformFn = twinConfig.originalTransformerPath
      ? require(twinConfig.originalTransformerPath).transform
      : worker.transform;

    if (platformOutput && matchCss(filename) && filename.includes(path.basename(platformOutput))) {
      yield* Effect.logInfo('[METRO_TRANSFORMER]: Detect css file', filename);
      const result: TransformResponse = yield* Effect.promise(() =>
        transformCSSExpo(config, projectRoot, filename, data, options),
      );
      return result;
    }
    const isAllowedPath = yield* ctx.isAllowedPath(filename);

    if (!isAllowedPath) {
      return yield* Effect.promise(() => transform(config, projectRoot, filename, data, options));
    }

    let code = data.toString('utf-8');
    const ast = yield* getAst(filename, code);
    const output = yield* twinTransformProgram(ast, platform as any);

    code = `${output.generated.code}`;

    const transformed = yield* Effect.promise(() =>
      transform(config, projectRoot, filename, Buffer.from(code, 'utf-8'), options),
    );

    if (process.env['NODE_ENV'] === 'test') {
      const result: Awaited<ReturnType<TwinMetroTransformFn>> = {
        dependencies: [],
        output: [
          {
            data: {
              code,
              functionMap: { mappings: '', names: [] },
              lineCount: ast.ast.end ?? 0,
              map: [],
            },
            type: 'js/module',
          },
        ],
      };
      return result;
    }
    return transformed;
  }).pipe(
    Effect.provide(MainLayer),
    Effect.provide(
      TwinNodeContext.Default({
        inputCSS: config.twinConfig.inputCSS,
        outDir: config.twinConfig.outputDir,
        rootDir: config.twinConfig.projectRoot,
        twinConfigPath: config.twinConfig.twinConfigPath,
        logLevel: config.twinConfig.logLevel,
      }),
    ),
    Logger.withMinimumLogLevel(LogLevel.fromLiteral(config.twinConfig.logLevel)),
    Effect.runPromise,
  );
