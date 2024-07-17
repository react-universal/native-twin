import { GetTransformOptions, mergeConfig } from 'metro-config';
import path from 'node:path';
import { decorateMetroServer } from './decorators/server.decorator';
// import { createMetroResolver } from './modules/metro.resolver';
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
      const options = {
        ...args[1],
        tailwindConfigPath: twinConfigPath,
        outputDir: output,
        allowedFiles: twConfig.content,
      };
      return metroConfig.transformer?.getTransformOptions(
        args[0],
        options as Parameters<GetTransformOptions>['1'],
        args[2],
      );
    }
    return {};
  };
  const output = path.resolve(projectRoot, path.join(outputDir));

  const twConfig = getUserNativeWindConfig(twinConfigPath, output);
  metroConfig.server = decorateMetroServer(metroConfig.server, twConfig);

  const newConfig: ComposableIntermediateConfigT = {
    ...metroConfig,
    // resolver: {
    //   ...metroConfig.resolver,
    //   resolveRequest: createMetroResolver({
    //     configPath: twinConfigPath,
    //     projectRoot: projectRoot,
    //   }),
    // },

    // stickyWorkers: true,
    // server: {
    //   ...metroConfig.server,
    //   rewriteRequestUrl(url) {
    //     console.log('URL: ', url);
    //     return url;
    //   },

    // },
    // resetCache: true,
    reporter: {
      update(event) {
        if (event.type === 'worker_stdout_chunk') {
          console.log('REPORTER: ', `${event.chunk}`);
        }
      },
    },
    transformerPath: require.resolve('./metro.transformer'),
    transformer: {
      ...metroConfig.transformer,
      tailwindConfigPath: twinConfigPath,
      outputDir: output,
      allowedFiles: twConfig.content,
      // transformerPath: require.resolve('./metro.transformer'),
      // babelTransformerPath: require.resolve('./metro.babel-transformer'),
      getTransformOptions,
    },
  };
  return mergeConfig(metroConfig, newConfig);
}
