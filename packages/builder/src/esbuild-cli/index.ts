import * as Layer from 'effect/Layer';
import { CliBuildConfigInput } from '../config/config.types';
import { BuilderConfig, BuilderService } from '../services/Builder.service';
import { TwinLogger } from '../utils/logger';
import { esbuildBuild, esbuildWatch } from './twin.esbuild';

export const makeEsbuildLayer = (options: CliBuildConfigInput) => {
  return Layer.succeed(BuilderService, {
    build: esbuildBuild,
    watch: esbuildWatch,
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
