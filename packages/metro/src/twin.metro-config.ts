import type { GetTransformOptions } from 'metro-config';
import fs from 'node:fs';
import path from 'node:path';
import type {
  MetroWithNativeWindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { decorateMetroServer } from './server/server.decorator';
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
  metroConfig.server = decorateMetroServer(metroConfig.server, twConfig);

  return {
    ...metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: output,
      allowedFiles: twConfig.content,
      getTransformOptions,
    },
  };
}
