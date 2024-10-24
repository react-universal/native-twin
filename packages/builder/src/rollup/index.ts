import * as Layer from 'effect/Layer';
import { CliBuildConfigInput } from '../config/config.types';
import { BuilderConfig, BuilderService } from '../services/Builder.service';
import { TwinLogger } from '../utils/logger';
import { rollupBuild } from './rollup.builder';
import { rollupWatcher } from './rollup.watcher';

export const makeRollupLayer = (options: CliBuildConfigInput) => {
  return Layer.succeed(BuilderService, {
    build: rollupBuild,
    watch: rollupWatcher,
  }).pipe(
    Layer.provideMerge(
      BuilderConfig.Live({
        configFile: options.configFile,
        watch: options.watch,
      }),
    ),
    Layer.provide(TwinLogger),
  );
};
