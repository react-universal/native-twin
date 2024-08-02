import type { GetTransformOptions } from 'metro-config';
import path from 'node:path';
import { createWatcher } from './cli';
import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeWindOptions,
  ComposableIntermediateConfigT,
  MetroContextConfig,
} from './metro.types';
import {
  createCacheDir,
  getUserNativeWindConfig,
  TWIN_CACHE_DIR,
  TWIN_STYLES_FILE,
} from './utils';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    projectRoot = process.cwd(),
    configPath: twinConfigPath = 'tailwind.config.ts',
  }: MetroWithNativeWindOptions = {},
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

  const getTransformOptions = async (...args: Parameters<GetTransformOptions>) => {
    return metroConfig.transformer?.getTransformOptions(...args);
  };

  const twConfig = getUserNativeWindConfig(twinConfigPath, metroContext.outputDir);

  const { watcher, processFiles } = createWatcher(
    {
      configPath: twinConfigPath,
      projectRoot: projectRoot,
    },
    twConfig,
  );

  const deferred: string[] = [];

  watcher.on('add', (path) => {
    // console.log('ADD: ', path);
    deferred.push(path);
  });
  watcher.on('ready', () => {
    // console.log('READY');
    processFiles(deferred, {
      configPath: twinConfigPath,
      projectRoot,
    });
  });
  watcher.on('change', (_path, _stats) => {
    // console.log('CHANGED_PATH: ', path);
    // console.log('STATS: ', stats);
  });

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
