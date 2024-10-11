import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import { pipe } from 'effect/Function';
import micromatch from 'micromatch';
import path from 'path';
import {
  createTwinCSSFiles,
  getTwinCacheDir,
  getUserTwinConfig,
  InternalTwinConfig,
  setupNativeTwin,
  TWIN_CSS_FILES,
} from '@native-twin/babel/jsx-babel';
import type { TailwindConfig } from '@native-twin/core';
import type { InternalTwFn } from '@native-twin/language-service';
import type {
  ComposableIntermediateConfigT,
  MetroWithNativeTwindOptions,
} from '../metro.types';

export class MetroConfigService extends Context.Tag('metro/config/context')<
  MetroConfigService,
  {
    metroConfig: ComposableIntermediateConfigT;
    isAllowedPath: (filePath: string) => boolean;
    twinConfig: TailwindConfig<InternalTwinConfig>;
    getPlatformOutput: (platform: string) => string;
    getPlatformInput: (platform: string) => string;
    getTwinConfigPath: () => string;
    twin: InternalTwFn;
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

export const makeTwinConfig = (
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
) => {
  const projectRoot = nativeTwinConfig.projectRoot ?? process.cwd();
  const outputDir = getTwinCacheDir();

  const twinConfigPath = nativeTwinConfig.configPath ?? 'tailwind.config.ts';

  const twinConfig = getUserTwinConfig('', {
    engine: 'hermes',
    isDev: process.env?.['NODE_ENV'] !== 'production',
    isServer: false,
    platform: 'web',
    twinConfigPath: twinConfigPath,
  });
  const twin = setupNativeTwin(twinConfig, {
    engine: 'hermes',
    isDev: process.env?.['NODE_ENV'] !== 'production',
    isServer: false,
    platform: 'web',
  });
  const { inputCSS } = createTwinCSSFiles({
    outputDir: outputDir,
    inputCSS: nativeTwinConfig.inputCSS,
  });
  const allowedPathsGlob = pipe(
    twinConfig.content,
    RA.map((x) => path.join(metroConfig.projectRoot, x)),
  );

  const allowedPaths = pipe(
    allowedPathsGlob,
    RA.map((x) => micromatch.scan(x)),
    RA.map((x) => x.base),
  );

  const platformOutputs = TWIN_CSS_FILES.map((x) => path.join(outputDir, x));

  const userConfig = {
    allowedPaths,
    allowedPathsGlob,
    outputDir,
    projectRoot,
    twinConfigPath,
    inputCSS,
    outputCSS: 'twin.css.native.js',
    platformOutputs,
  };

  const isAllowedPath = (filePath: string) =>
    micromatch.isMatch(filePath, allowedPathsGlob);

  return {
    isAllowedPath,
    getPlatformOutput: (platform: string) => {
      return (
        platformOutputs.find((x) => x.includes(`${platform}.`)) ?? 'twin.css.native.js'
      );
    },
    getPlatformInput: () => path.join(projectRoot, inputCSS),
    getTwinConfigPath: () => path.resolve(twinConfigPath),
    metroConfig,
    twinConfig,
    twin,
    userConfig,
  };
};
