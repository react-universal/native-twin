// import { Effect } from 'effect';
import type { GetTransformOptions } from 'metro-config';
import micromatch from 'micromatch';
import path from 'node:path';
import { inspect } from 'node:util';
// import { makeWatcher } from './cli';
// import { makeLive } from './cli/MetroCli.service';
import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
  MetroContextConfig,
} from './metro.types';
import {
  createCacheDir,
  getUserNativeTwinConfig,
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
  const isDev = Boolean(process.env['NODE_ENV']) === true;
  const isHot = Boolean(process.env['NODE_ENV']) === true;
  outputDir = path.join(projectRoot, outputDir);
  createCacheDir(outputDir);
  const twinCacheFile = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  const twConfig = getUserNativeTwinConfig(twinConfigPath, outputDir);

  const twin = setupNativeTwin(twConfig, {
    dev: isDev,
    hot: isHot,
    platform: 'ios',
  });

  const allowedPaths = twConfig.content.map((x) => path.join(projectRoot, x));
  // allowedPaths.push(
  //   path.join(projectRoot, './node_modules/.cache/native-twin/**/*.{js,jsx,tsx,ts}'),
  // );
  const metroContext: MetroContextConfig = {
    configPath: twinConfigPath,
    dev: isDev,
    hot: isHot,
    projectRoot,
    outputDir,
    twinCacheFile,
    twin,
    twConfig,
    platform: 'ios',
    allowedPaths,
  };

  const getTransformOptions = async (...args: Parameters<GetTransformOptions>) => {
    return metroConfig.transformer?.getTransformOptions(...args);
  };

  // compilerRunnable.pipe(
  //   Effect.provide(makeLive(metroContext)),
  //   NodeRuntime.runMain,
  // );
  // makeWatcher.pipe(Effect.provide(makeLive(metroContext)), Effect.runPromise);

  const server = decorateMetroServer(metroConfig, twConfig, metroContext);

  const originalModuleFilter = metroConfig.serializer.processModuleFilter;
  return {
    ...metroConfig,
    resetCache: true,
    server: server.server,
    // resolver: server.resolver,
    // transformerPath: require.resolve('./transformer/metro.transformer'),
    serializer: {
      ...metroConfig.serializer,
      processModuleFilter: (module) => {
        if (micromatch.isMatch(path.resolve(module.path), metroContext.allowedPaths)) {
          console.log(
            'MODULE: ',
            inspect(
              {
                name: module.path,
                buff: module.getSource().toString('utf-8'),
                code: module.output,
              },
              false,
              null,
              true,
            ),
          );
        }
        return originalModuleFilter(module);
      },
    },
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
