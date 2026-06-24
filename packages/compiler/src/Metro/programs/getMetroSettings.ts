import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { TwinNodeContext } from '../../Config';
import type { BaseTwinTransformerOptions } from '../Metro.models';

export const getMetroSettings = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const allowedFiles = yield* ctx.state.twinConfig.get.pipe(
    Effect.flatMap((config) => ctx.getProjectFilesFromConfig(config, 'sync')),
  );

  const transformerOptions: BaseTwinTransformerOptions = {
    inputCSS: ctx.env.inputCSS,
    allowedPaths: allowedFiles,
    logLevel: ctx.env.logLevel._tag,
    allowedPathsGlob: allowedFiles,
    outputDir: ctx.env.outputDir,
    projectRoot: ctx.env.projectRoot,
    platformOutputs: ctx.env.platformPaths,
    twinConfigPath: ctx.env.twinConfigPath.pipe(Option.getOrThrow),
    runtimeEntries: [],
  };

  return {
    transformerOptions,
    ctx,
    env: ctx.env,
  };
});
