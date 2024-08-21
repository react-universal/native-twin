import upstreamTransformer from '@expo/metro-config/babel-transformer';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import micromatch from 'micromatch';
import nodePath from 'node:path';
import type { __Theme__ } from '@native-twin/core';
import {
  getTwinConfig,
  setupNativeTwin,
  TWIN_CACHE_DIR,
  TWIN_STYLES_FILE,
} from '../../utils';
import { BabelTransformerConfig, BabelTransformerFn } from './babel.types';

export class BabelTransformerContext extends Context.Tag('babel/transformer-context')<
  BabelTransformerContext,
  BabelTransformerConfig
>() {
  static make = ({ filename, options, src }: Parameters<BabelTransformerFn>[0]) =>
    Layer.effect(
      BabelTransformerContext,
      Effect.sync(() => {
        const cssOutput = nodePath.join(
          options.projectRoot,
          TWIN_CACHE_DIR,
          TWIN_STYLES_FILE,
        );
        const platform = options.platform;
        const twinConfig = getTwinConfig(options.projectRoot);
        const twin = setupNativeTwin(twinConfig.twinConfig, {
          dev: options.dev,
          hot: options.dev,
          platform,
        });

        return {
          options,
          cssOutput,
          code: src,
          filename: filename,
          twinCtx: {
            baseRem: twin.config.root.rem ?? 16,
            platform,
          },
          twin,
          twinConfig: twinConfig.twinConfig,
          allowedPaths: twinConfig.allowedPaths,
          platform,
        };
      }),
    );
}

export class BabelTransformerService extends Context.Tag('babel/TransformerService')<
  BabelTransformerService,
  {
    isNotAllowedPath(path: string): boolean;
    transform(code: string): Promise<any>;
  }
>() {}

export const BabelTransformerServiceLive = Layer.effect(
  BabelTransformerService,
  Effect.gen(function* () {
    const ctx = yield* BabelTransformerContext;

    return {
      isNotAllowedPath: (file) => {
        return !micromatch.isMatch(
          nodePath.resolve(ctx.options.projectRoot, file),
          ctx.allowedPaths,
        );
      },
      transform: (code) => {
        // @ts-expect-error
        return upstreamTransformer.transform({
          src: code,
          options: ctx.options,
          filename: ctx.filename,
        });
      },
    };
  }),
);
