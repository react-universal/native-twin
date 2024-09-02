import type {
  GetTransformOptions,
  ExtraTransformOptions,
  GetTransformOptionsOpts,
} from 'metro-config';
import path from 'node:path';
import { createTwinCSSFiles, getUserTwinConfig } from '@native-twin/babel/jsx-babel';
import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  const projectRoot = nativeTwinConfig.projectRoot ?? process.cwd();
  const outputDirConfig =
    nativeTwinConfig.outputDir ??
    ['node_modules', '.cache', 'native-twin'].join(path.sep);
  const twinConfigPath = nativeTwinConfig.configPath ?? 'tailwind.config.ts';
  const outputDir = path.join(projectRoot, outputDirConfig);

  const twConfig = getUserTwinConfig('', {
    engine: 'hermes',
    isDev: process.env?.['NODE_ENV'] !== 'production',
    isServer: false,
    platform: 'ios',
    twinConfigPath: twinConfigPath,
  });

  const originalGetTransformOptions = metroConfig.transformer.getTransformOptions;

  const { inputCss, outputCss } = createTwinCSSFiles({
    outputDir: outputDir,
    inputCSS: nativeTwinConfig.inputCSS,
    twConfig,
  });

  const getTransformOptions = async (
    ...args: Parameters<GetTransformOptions>
  ): Promise<Partial<ExtraTransformOptions>> => {
    const [filename, config, getDeps] = args;
    const newConfig: GetTransformOptionsOpts = {
      ...config,
      // @ts-expect-error
      customTransformerOption: {
        inputCss,
        outputCss,
      },
      inputCss,
      outputCss,
    };
    const original = await originalGetTransformOptions(filename, newConfig, getDeps);
    return {
      ...original,
      transform: {
        ...original.transform,
        // @ts-expect-error
        inputCss,
        outputCss,
      },
    };
  };

  const { resolver } = decorateMetroServer(metroConfig, twConfig, {
    cssInput: inputCss,
    outputFile: outputCss,
    twinConfigPath,
  });
  // console.log('CONFIG: ser', inspect(metroConfig));
  return {
    ...metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    // server,
    resolver,
    transformer: {
      ...metroConfig.transformer,
      unstable_allowRequireContext: true,
      babelTransformerPath: require.resolve('./transformer/babel.transformer'),
      tailwindConfigPath: twinConfigPath,
      outputDir: outputDir,
      allowedFiles: twConfig.content,
      inputCss,
      outputCss,
      // serverURL: `${server.unstable_serverRoot}:${metroConfig.server.port}`,
      getTransformOptions,
    },
  };
}
