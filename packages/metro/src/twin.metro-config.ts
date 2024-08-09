import * as Effect from 'effect/Effect';
import type { GetTransformOptions } from 'metro-config';
import path from 'node:path';
import { compilerRunnable } from './cli';
import { makeLive } from './cli/MetroCli.service';
import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
  MetroContextConfig,
} from './metro.types';
import {
  createCacheDir,
  getUserNativeWindConfig,
  setupNativeTwin,
  TWIN_CACHE_DIR,
  TWIN_STYLES_FILE,
} from './utils';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    projectRoot = process.cwd(),
    configPath: twinConfigPath = 'tailwind.config.ts',
  }: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const metroContext: MetroContextConfig = {
    configPath: twinConfigPath,
    dev: Boolean(process.env['NODE_ENV']) === true,
    hot: Boolean(process.env['NODE_ENV']) === true,
    projectRoot,
    outputDir: path.join(projectRoot, outputDir),
    twinCacheFile: path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE),
  };

  createCacheDir(metroContext.outputDir);

  const twConfig = getUserNativeWindConfig(twinConfigPath, metroContext.outputDir);

  const getTransformOptions = async (...args: Parameters<GetTransformOptions>) => {
    return metroConfig.transformer?.getTransformOptions(...args);
  };

  const twin = setupNativeTwin(twConfig, {
    dev: metroContext.dev,
    hot: metroContext.hot,
    platform: 'ios',
  });
  const runResult = compilerRunnable.pipe(
    Effect.provide(
      makeLive({
        ...metroContext,
        twConfig,
        platform: 'ios',
        twin: twin.tw,
      }),
    ),
    Effect.runFork,
  );
  runResult;

  return {
    ...metroConfig,
    resetCache: true,
    server: decorateMetroServer(
      metroConfig,
      twConfig,
      path.join(metroContext.outputDir, TWIN_STYLES_FILE),
    ),

    // resolver: createMetroResolver(
    //   metroConfig.resolver,
    //   {
    //     configPath: twinConfigPath,
    //     projectRoot,
    //   },
    //   twConfig.content,
    // ),
    transformerPath: require.resolve('./transformer/metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: metroContext.outputDir,
      allowedFiles: twConfig.content,
      transformerPath: metroConfig.transformerPath,
      getTransformOptions,
    },
  };
}
