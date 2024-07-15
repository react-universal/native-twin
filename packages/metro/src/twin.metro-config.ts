import { GetTransformOptions } from 'metro-config';
import path from 'node:path';
import { createMetroResolver } from './modules/metro.resolver';
import { ComposableIntermediateConfigT } from './types/metro.types';
import { MetroWithNativeWindOptions } from './types/metro.types';
import { getUserNativeWindConfig } from './utils/load-config';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    projectRoot = process.cwd(),
    configPath: twinConfigPath = 'tailwind.config.ts',
  }: MetroWithNativeWindOptions = {},
): ComposableIntermediateConfigT {
  const getTransformOptions = async (...args: Parameters<GetTransformOptions>) => {
    if (metroConfig.transformer?.getTransformOptions) {
      return metroConfig.transformer?.getTransformOptions(...args);
    }
    return {};
  };
  const output = path.resolve(projectRoot, path.join(outputDir));

  const twConfig = getUserNativeWindConfig(twinConfigPath, output);

  return {
    ...metroConfig,
    resolver: {
      ...metroConfig.resolver,
      resolveRequest: createMetroResolver({
        configPath: twinConfigPath,
        projectRoot: projectRoot,
      }),
    },
    // transformerPath: require.resolve('./metro.transformer'),
    reporter: {
      update(event) {
        if (event.type === 'worker_stdout_chunk') {
          console.log('REPORTER: ', `${event.chunk}`);
        }
      },
    },
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: output,
      allowedFiles: twConfig.content,
      getTransformOptions,
    },
  };
}
