import * as Effect from 'effect/Effect';
import type { GetTransformOptions } from 'metro-config';
import { MetroConfigService } from '../MetroConfig.service';
import { setupPlatform } from './TwinFileSystem';

const alreadySetup: Set<string> = new Set();
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

    if (
      options.platform &&
      !alreadySetup.has(options.platform) &&
      options.platform === 'web'
    ) {
      alreadySetup.add(options.platform);
      yield* setupPlatform(options.platform ?? 'native');
    }

    return result;
  });
