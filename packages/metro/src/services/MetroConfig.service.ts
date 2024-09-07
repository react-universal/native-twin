import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import { pipe } from 'effect/Function';
import micromatch from 'micromatch';
import path from 'path';
import {
  createTwinCSSFiles,
  getUserTwinConfig,
  InternalTwinConfig,
  setupNativeTwin,
} from '@native-twin/babel/jsx-babel';
import { TailwindConfig } from '@native-twin/core';
import { InternalTwFn } from '@native-twin/language-service';
import {
  ComposableIntermediateConfigT,
  MetroWithNativeTwindOptions,
} from '../metro.types';

export class MetroConfigService extends Context.Tag('metro/config/context')<
  MetroConfigService,
  {
    metroConfig: ComposableIntermediateConfigT;
    isAllowedPath: (filePath: string) => boolean;
    twinConfig: TailwindConfig<InternalTwinConfig>;
    twin: InternalTwFn;
    userConfig: {
      allowedPaths: string[];
      allowedPathsGlob: string[];
      projectRoot: string;
      outputDir: string;
      twinConfigPath: string;
      inputCSS: string;
      outputCSS: string;
    };
  }
>() {}

export const makeTwinConfig = (
  metroConfig: ComposableIntermediateConfigT,
  nativeTwinConfig: MetroWithNativeTwindOptions = {},
) => {
  const projectRoot = nativeTwinConfig.projectRoot ?? process.cwd();
  const outputDir = path.join(
    projectRoot,
    nativeTwinConfig.outputDir ??
      ['node_modules', '.cache', 'native-twin'].join(path.sep),
  );

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
  const { inputCSS, outputCSS } = createTwinCSSFiles({
    outputDir: outputDir,
    inputCSS: nativeTwinConfig.inputCSS,
    twConfig: twinConfig,
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

  const userConfig = {
    allowedPaths,
    allowedPathsGlob,
    outputDir,
    projectRoot,
    twinConfigPath,
    inputCSS,
    outputCSS,
  };

  const isAllowedPath = (filePath: string) =>
    micromatch.isMatch(filePath, allowedPathsGlob);

  return {
    isAllowedPath,
    metroConfig,
    twinConfig,
    twin,
    userConfig,
  };
};
