import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { IntermediateConfigT, TransformerConfigT } from 'metro-config';
import { createTwinCSSFiles, getTwinCacheDir, NativeTwinManager } from '../../node';
import { twinMetroRequestResolver } from '../metro.resolver';

// MARK: Metro config types
/** @domain Metro transformer config */
type TwinTransformerConfig = TransformerConfigT & {
  transformerPath?: string;
} & Record<string, unknown>;

/** @domain Metro config options */
export interface TwinMetroConfig extends IntermediateConfigT {
  transformer: TwinTransformerConfig;
}

/** @domain Metro config options */
export interface MetroWithNativeTwindOptions {
  projectRoot?: string;
  outputDir?: string;
  configPath?: string;
  inputCSS?: string;
  debug?: boolean;
}

/** @domain Metro services */
export class MetroConfigService extends Context.Tag('metro/config/service')<
  MetroConfigService,
  {
    metroConfig: TwinMetroConfig;
    userConfig: {
      allowedPaths: string[];
      allowedPathsGlob: string[];
      projectRoot: string;
      outputDir: string;
      twinConfigPath: string;
      inputCSS: string;
      outputCSS: string;
      platformOutputs: string[];
    };
  }
>() {}

export const createMetroConfig = (
  metroConfig: TwinMetroConfig,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
) => {
  const projectRoot = nativeTwinConfig.projectRoot ?? process.cwd();
  const outputDir = getTwinCacheDir();
  const { inputCSS } = createTwinCSSFiles({
    outputDir: outputDir,
    inputCSS: nativeTwinConfig.inputCSS,
  });
  const twin = new NativeTwinManager(
    nativeTwinConfig.configPath ?? 'tailwind.config.ts',
    projectRoot,
    inputCSS,
    'native',
  );

  const originalResolver = metroConfig.resolver.resolveRequest;
  const resolver = twinMetroRequestResolver(originalResolver, twin);

  const userConfig = {
    allowedPaths: twin.allowedPaths,
    allowedPathsGlob: twin.allowedPathsGlob,
    outputDir,
    projectRoot,
    inputCSS,
    outputCSS: twin.getPlatformOutput('native'),
    platformOutputs: twin.platformOutputs,
    twinConfigPath: twin.twinConfigPath,
  };

  return {
    userConfig,
    metroConfig: {
      ...metroConfig,
      resolver: {
        ...metroConfig.resolver,
        resolveRequest: resolver,
      },
    },
  };
};

export const make = (config: MetroConfigService['Type']) =>
  Effect.gen(function* () {
    return MetroConfigService.of(config);
  }).pipe(Layer.scoped(MetroConfigService));
