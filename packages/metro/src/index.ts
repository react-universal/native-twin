import connect from 'connect';
import 'metro-config';
import path from 'node:path';
import { ComposableIntermediateConfigT } from './metro.types';
import { getUserNativeWindConfig, setupNativeTwin } from './utils/load-config';

export interface CssToReactNativeRuntimeOptions {}

interface WithNativeWindOptions extends CssToReactNativeRuntimeOptions {
  projectRoot?: string;
  outputDir?: string;
  configPath?: string;
  browserslist?: string | null;
  browserslistEnv?: string | null;
}
// const outputCSS: Record<string, string> = {};

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    // inlineRem = 14,
    projectRoot = process.cwd(),
    configPath: tailwindConfigPath = 'tailwind.config.ts',
  }: WithNativeWindOptions = {} as WithNativeWindOptions,
) {
  const output = path.resolve(projectRoot, path.join(outputDir));

  const twConfig = getUserNativeWindConfig(tailwindConfigPath, output);

  // This is marked as deprecated, Expo SDK HEAVY RELIES on this, so its not going anywhere anytime soon
  const enhanceMiddleware = metroConfig.server.enhanceMiddleware;
  const getTransformOptions = metroConfig.transformer.getTransformOptions;

  metroConfig.transformerPath = require.resolve('./transformer');

  metroConfig.server = {
    ...metroConfig.server,
    enhanceMiddleware(middleware, metroServer) {
      let server = connect().use('/', async (req, _res, next) => {
        const url = new URL(req.url!, 'http://localhost');
        const platform = url.searchParams.get('platform');

        if (platform) {
          try {
            setupNativeTwin(twConfig, {
              platform,
              dev: url.searchParams.get('dev') !== 'false',
              hot: url.searchParams.get('hot') !== 'true',
            });
          } catch (error) {
            return next(error);
          }
        }

        next();
      });

      if (enhanceMiddleware) {
        server = server.use(enhanceMiddleware(middleware, metroServer));
      }

      return server;
    },
  };

  metroConfig.transformer = {
    ...metroConfig.transformer,
    allowedFiles: twConfig.content,
    async getTransformOptions(entryPoints, options, getDependenciesOf) {
      return getTransformOptions(entryPoints, options, getDependenciesOf);
    },
  };

  return metroConfig;
}
