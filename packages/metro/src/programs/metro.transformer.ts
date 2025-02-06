import * as path from 'node:path';
import {
  BabelCompilerContext,
  CompilerConfigContext,
  TWIN_DEFAULT_PLUGIN_CONFIG,
  TwinNodeContext,
  getBabelAST,
} from '@native-twin/compiler';
import { matchCss } from '@native-twin/helpers/server';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import type { TransformResponse } from 'metro-transform-worker';
import * as worker from 'metro-transform-worker';
import type { TwinMetroTransformFn } from '../models/Metro.models.js';
import { MetroLayerWithTwinFS } from '../services/Metro.layers.js';
import { transformCSSExpo } from '../utils/css.utils.js';

type MetroTransformFn = typeof worker.transform;

export const transform: TwinMetroTransformFn = async (
  config,
  projectRoot,
  filename,
  data,
  options,
) =>
  Effect.gen(function* () {
    const twinConfig = config.twinConfig;
    const platform = options.platform ?? 'native';
    const { extractJSXElementTrees, jsxElementTreeToSheets, transformAstWithSheets } =
      yield* BabelCompilerContext;
    const ctx = yield* TwinNodeContext;

    const platformOutput = ctx.getOutputCSSPath(platform);

    const transform: MetroTransformFn = twinConfig.originalTransformerPath
      ? require(twinConfig.originalTransformerPath).transform
      : worker.transform;

    if (
      platformOutput &&
      matchCss(filename) &&
      filename.includes(path.basename(platformOutput))
    ) {
      console.log('[METRO_TRANSFORMER]: Detect css file', filename);
      const result: TransformResponse = yield* Effect.promise(() =>
        transformCSSExpo(config, projectRoot, filename, data, options),
      );
      return result;
    }

    if (!(yield* ctx.isAllowedPath(filename))) {
      return yield* Effect.promise(() =>
        transform(config, projectRoot, filename, data, options),
      );
    }

    let code = data.toString('utf-8');
    const ast = yield* Effect.sync(() => getBabelAST(code, filename));

    const documentSheets = yield* extractJSXElementTrees(
      ast,
      TWIN_DEFAULT_PLUGIN_CONFIG,
    ).pipe(
      Stream.mapEffect((tree) => jsxElementTreeToSheets(tree, platform)),
      Stream.flatMap((tree) => Stream.fromIterable(tree.all().map((x) => x.value))),
      Stream.runCollect,
    );

    const output = yield* Effect.sync(() => transformAstWithSheets(ast, documentSheets));

    code = `const __Twin___StyleSheet = require('@native-twin/jsx/sheet').StyleSheet;
            \n\n${output}`;

    const transformed = yield* Effect.promise(() =>
      transform(config, projectRoot, filename, Buffer.from(code, 'utf-8'), options),
    );

    return transformed;
  }).pipe(
    Effect.provide(MetroLayerWithTwinFS),
    Effect.provide(
      Layer.succeed(CompilerConfigContext, {
        inputCSS: config.twinConfig.inputCSS,
        logLevel: LogLevel.fromLiteral(config.twinConfig.logLevel),
        outputDir: config.twinConfig.outputDir,
        platformPaths: config.twinConfig.platformOutputs,
        projectRoot: config.twinConfig.projectRoot,
        twinConfigPath: Option.fromNullable(config.twinConfig.twinConfigPath),
      }),
    ),
    Logger.withMinimumLogLevel(LogLevel.fromLiteral(config.twinConfig.logLevel)),
    Effect.runPromise,
  );
