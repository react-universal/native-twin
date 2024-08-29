import type {
  GetTransformOptions,
  ExtraTransformOptions,
  GetTransformOptionsOpts,
} from 'metro-config';
import path from 'node:path';
// import { decorateMetroServer } from './config/server/server.decorator';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { getUserNativeTwinConfig } from './utils';
import { createTwinCSSFiles } from './utils/file.utils';

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
  const { inputCss, outputCss } = createTwinCSSFiles(
    outputDir,
    nativeTwinConfig.inputCSS,
  );
  // createCacheDir(outputDir);

  const twConfig = getUserNativeTwinConfig(twinConfigPath, outputDir);

  const originalGerTransformOptions = metroConfig.transformer.getTransformOptions;

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
    const original = await originalGerTransformOptions(filename, newConfig, getDeps);
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

  // const { server } = decorateMetroServer(metroConfig, twConfig);

  return {
    ...metroConfig,
    transformerPath: require.resolve('./transformer/metro.transformer'),
    // server,
    transformer: {
      ...metroConfig.transformer,
      babelTransformerPath: require.resolve('./transformer/babel.transformer'),
      tailwindConfigPath: twinConfigPath,
      outputDir: outputDir,
      allowedFiles: twConfig.content,
      transformerPath: metroConfig.transformerPath,
      inputCss,
      outputCss,
      getTransformOptions,
    },
  };
}
