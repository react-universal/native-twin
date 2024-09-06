import * as Effect from 'effect/Effect';
import type { GetTransformOptions } from 'metro-config';
import { MetroConfigService } from './MetroConfig.service';
import { setupPlatform } from './TwinFileSystem';

/** @category Programs */
export const getTransformerOptions = (
  ...[entryPoints, options, getDeps]: Parameters<GetTransformOptions>
) =>
  Effect.gen(function* () {
    const ctx = yield* MetroConfigService;

    const { metroConfig } = ctx;
    const originalGetTransformOptions = metroConfig.transformer.getTransformOptions;

    const result = yield* Effect.promise(() =>
      originalGetTransformOptions(entryPoints, options, getDeps),
    );

    if (options.platform) {
      yield* setupPlatform(options.platform).pipe(Effect.forkDaemon);
    }

    return result;
  });
