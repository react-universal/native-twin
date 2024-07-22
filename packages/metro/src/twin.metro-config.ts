import { GetTransformOptions } from 'metro-config';
import fs from 'node:fs';
import path from 'node:path';
import { decorateMetroServer } from './server/server.decorator';
import { ComposableIntermediateConfigT } from './types/metro.types';
import { MetroWithNativeWindOptions } from './types/metro.types';
import { TWIN_CACHE_DIR, TWIN_STYLES_FILE } from './utils/constants';
import { getUserNativeWindConfig } from './utils/load-config';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    projectRoot = process.cwd(),
    configPath: twinConfigPath = 'tailwind.config.ts',
  }: MetroWithNativeWindOptions = {},
): ComposableIntermediateConfigT {
  const twinFilePath = path.join(projectRoot, TWIN_CACHE_DIR, TWIN_STYLES_FILE);
  console.log('START_METRO');
  if (fs.existsSync(twinFilePath)) {
    fs.writeFileSync(twinFilePath, '');
  }
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
    resetCache: true,
    // resetCache: true,
    reporter: {
      update(event) {
        if (event.type === 'worker_stdout_chunk') {
          console.log('REPORTER: ', `${event.chunk}`);
        }
      },
    },
    transformerPath: require.resolve('./transformer/metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: output,
      allowedFiles: twConfig.content,
      // transformerPath: require.resolve('./metro.transformer'),
      // babelTransformerPath: require.resolve('./transformer/metro.babel-transformer'),
      getTransformOptions,
    },
  };
}
