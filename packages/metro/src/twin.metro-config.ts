import type { GetTransformOptions, ExtraTransformOptions } from 'metro-config';
import path from 'node:path';
import type {
  MetroWithNativeTwindOptions,
  ComposableIntermediateConfigT,
} from './metro.types';
import { createCacheDir, getUserNativeTwinConfig } from './utils';

export function withNativeTwin(
  metroConfig: ComposableIntermediateConfigT,
  {
    outputDir = ['node_modules', '.cache', 'native-twin'].join(path.sep),
    projectRoot = process.cwd(),
    configPath: twinConfigPath = 'tailwind.config.ts',
  }: MetroWithNativeTwindOptions = {},
): ComposableIntermediateConfigT {
  outputDir = path.join(projectRoot, outputDir);
  createCacheDir(outputDir);

  const twConfig = getUserNativeTwinConfig(twinConfigPath, outputDir);

  const allowedPaths = twConfig.content.map((x) => path.join(projectRoot, x));

  const originalGerTransformOptions = metroConfig.transformer.getTransformOptions;

  const getTransformOptions = async (
    ...args: Parameters<GetTransformOptions>
  ): Promise<Partial<ExtraTransformOptions>> => {
    const [filename, config, getDeps] = args;
    const custom = {
      allowedPaths,
      outputDir,
      configPath: twinConfigPath,
    };
    return originalGerTransformOptions(
      filename,
      {
        ...config,
        ...custom,
      },
      getDeps,
    );
  };

  return {
    ...metroConfig,
    resetCache: true,
    transformer: {
      ...metroConfig.transformer,
      babelTransformerPath: require.resolve('./transformer/babel.transformer'),
      tailwindConfigPath: twinConfigPath,
      outputDir: outputDir,
      allowedFiles: twConfig.content,
      transformerPath: metroConfig.transformerPath,
      getTransformOptions,
    },
  };
}
