import { createVirtualSheet, Preflight } from '@native-twin/css';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import micromatch from 'micromatch';
import path from 'node:path';
import type { TailwindConfig } from '@native-twin/core';
import { defineConfig, setup } from '@native-twin/core';
import { CompilerContext } from '@native-twin/css/jsx';
import { TWIN_CSS_FILES } from '../../shared';
import { nodeRequireJS } from '../utils';
import type { InternalTwFn, InternalTwinConfig } from './twin.types';
import {
  createTwinCSSFiles,
  getTwinCacheDir,
  getTwinConfigPath,
} from './twin.utils.node';

export class NativeTwinManager {
  readonly tw: InternalTwFn;
  readonly config: TailwindConfig<InternalTwinConfig>;
  readonly preflight: Preflight;
  readonly platformOutputs: string[];
  readonly outputDir: string;
  constructor(
    readonly twinConfigPath: string,
    readonly projectRoot: string,
    readonly inputCSS: string,
    readonly platform = 'native',
  ) {
    this.config = this.getUserTwinConfig({ platform, twinConfigPath });
    this.tw = setup(this.config, createVirtualSheet());
    this.preflight = {};
    this.outputDir = getTwinCacheDir();
    this.platformOutputs = TWIN_CSS_FILES.map((x) => path.join(this.outputDir, x));
  }

  get sheetTarget() {
    return this.tw.target;
  }

  get baseRem() {
    return this.config.root.rem ?? 16;
  }

  get context(): CompilerContext {
    return {
      baseRem: this.baseRem,
      platform: this.platform,
    };
  }

  get allowedPathsGlob() {
    return RA.map(this.config.content, (x) => path.join(this.projectRoot, x));
  }

  get allowedPaths() {
    return pipe(
      this.allowedPathsGlob,
      RA.map((x) => micromatch.scan(x)),
      RA.map((x) => x.base),
    );
  }

  createCSSInput() {
    createTwinCSSFiles({
      outputDir: this.outputDir,
      inputCSS: this.inputCSS,
    });
  }

  isAllowedPath(filePath: string) {
    // console.log('ALLOWED_PATHS: ', filePath, this.allowedPathsGlob);
    return (
      micromatch.isMatch(path.join(this.projectRoot, filePath), this.allowedPathsGlob) ||
      micromatch.isMatch(filePath, this.allowedPathsGlob)
    );
  }

  getPlatformOutput(platform: string) {
    const output =
      this.platformOutputs.find((x) => x.includes(`${platform}.`)) ??
      require.resolve('@native-twin/core/build/.cache/twin.css.native.js');
    return output;
  }

  getPlatformInput() {
    return path.join(this.projectRoot, this.inputCSS);
  }

  getUserTwinConfig(params: {
    twinConfigPath: string;
    platform: string;
  }): TailwindConfig<InternalTwinConfig> {
    return pipe(
      getTwinConfigPath(this.projectRoot, params.twinConfigPath),
      Option.map((x) => {
        try {
          return nodeRequireJS<TailwindConfig<InternalTwinConfig>>(x);
        } catch (e) {
          console.log('ERROR_REQUIRE: ', x, e);
          return {
            content: [],
            root: { rem: 15 },
            mode: params.platform === 'web' ? 'web' : ('native' as 'web' | 'native'),
          };
        }
      }),
      Option.map((x) =>
        defineConfig({
          ...x,
          mode: params.platform === 'web' ? 'web' : x.mode ?? 'native',
          root: { rem: x.root.rem ?? 16 },
        }),
      ),
      Option.getOrElse(() =>
        defineConfig({
          content: [],
          mode: params.platform === 'web' ? 'web' : 'native',
          root: { rem: 16 },
        }),
      ),
    );
  }
}
