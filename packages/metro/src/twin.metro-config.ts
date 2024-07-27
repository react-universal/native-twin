import type { GetTransformOptions } from 'metro-config';
import fs from 'node:fs';
import path from 'node:path';
import { createWatcher } from './cli';
import { createMetroResolver } from './config/resolver/metro.resolver';
import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeWindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import {
  getUserNativeWindConfig,
  createCacheDir,
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
  createCacheDir(projectRoot);
  const twinFilePath = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  fs.writeFileSync(twinFilePath, '');

  const getTransformOptions = async (...args: Parameters<GetTransformOptions>) => {
    return metroConfig.transformer?.getTransformOptions(...args);
  };
  const output = path.resolve(projectRoot, path.join(outputDir));
  if (!fs.existsSync(path.resolve(output))) {
    fs.mkdirSync(output, { recursive: true });
  }

  const twConfig = getUserNativeWindConfig(twinConfigPath, output);

  const { watcher, processFiles } = createWatcher(
    {
      configPath: 'asd',
      projectRoot: projectRoot,
    },
    twConfig,
  );

  const deferred: string[] = [];

  watcher.on('add', (path) => {
    console.log('ADD: ', path);
    deferred.push(path);
  });
  watcher.on('ready', () => {
    console.log('READY');
    processFiles(deferred, {
      configPath: twinConfigPath,
      projectRoot,
    }).then((x) => {
      console.log('FILES: ', x);
    });
  });
  watcher.on('change', (path, stats) => {
    console.log('CHANGED_PATH: ', path);
    console.log('STATS: ', stats);
  });

  return {
    ...metroConfig,
    resetCache: true,
    server: decorateMetroServer(
      metroConfig,
      twConfig,
      path.join(output, TWIN_STYLES_FILE),
    ),
    resolver: createMetroResolver(
      metroConfig.resolver,
      {
        configPath: twinConfigPath,
        projectRoot,
      },
      twConfig.content,
    ),
    transformerPath: require.resolve('./transformer/metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: output,
      allowedFiles: twConfig.content,
      transformerPath: metroConfig.transformerPath,
      getTransformOptions,
    },
  };
}
