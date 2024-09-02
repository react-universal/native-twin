import { pipe } from 'effect';
import * as RA from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import type { GetTransformOptions, ExtraTransformOptions } from 'metro-config';
import micromatch from 'micromatch';
import path from 'path';
import {
  createTwinCSSFiles,
  getUserTwinConfig,
  InternalTwinConfig,
} from '@native-twin/babel/jsx-babel';
import { TailwindConfig } from '@native-twin/core';
import {
  ComposableIntermediateConfigT,
  MetroWithNativeTwindOptions,
} from '../metro.types';
import { metroConfigGetTransformerOptions } from './utils/getTransformerOptions';

export class MetroConfigService extends Context.Tag('metro/config/context')<
  MetroConfigService,
  {
    metroConfig: ComposableIntermediateConfigT;
    getTransformerOptions: (
      ...args: Parameters<GetTransformOptions>
    ) => Effect.Effect<Partial<ExtraTransformOptions>, never>;
    isAllowedPath: (filePath: string) => boolean;
    userConfig: {
      allowedPaths: string[];
      allowedPathsGlob: string[];
      twinConfig: TailwindConfig<InternalTwinConfig>;
      projectRoot: string;
      outputDir: string;
      twinConfigPath: string;
      inputCSS: string;
      outputCSS: string;
    };
  }
>() {
  static make = (
    metroConfig: ComposableIntermediateConfigT,
    nativeTwinConfig: MetroWithNativeTwindOptions = {},
  ) =>
    Layer.scoped(
      MetroConfigService,
      Effect.gen(function* () {
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
          platform: 'ios',
          twinConfigPath: twinConfigPath,
        });
        const { inputCSS, outputCSS } = createTwinCSSFiles({
          outputDir: outputDir,
          inputCSS: nativeTwinConfig.inputCSS,
          twConfig: twinConfig,
        });
        const allowedPathsGlob = pipe(
          twinConfig.content,
          RA.map((x) => path.resolve(metroConfig.projectRoot, x)),
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
          twinConfig,
          twinConfigPath,
          inputCSS,
          outputCSS,
        };

        const isAllowedPath = (filePath: string) =>
          micromatch.isMatch(filePath, allowedPathsGlob);

        return {
          getTransformerOptions: metroConfigGetTransformerOptions(
            metroConfig.transformer.getTransformOptions,
            userConfig,
          ),
          isAllowedPath,
          metroConfig,
          userConfig,
        };
      }),
    );
}
