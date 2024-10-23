import * as Chunk from 'effect/Chunk';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Stream from 'effect/Stream';
import type { GetTransformOptions, ExtraTransformOptions } from 'metro-config';
import type { CustomResolver } from 'metro-resolver';
import path from 'node:path';
import { TwinFSService } from '../file-system';
import { NativeTwinServiceNode } from '../native-twin';
import { MetroConfigService } from './services/MetroConfig.service';

const setupPlatforms: Set<string> = new Set();

export const twinMetroRequestResolver = (
  originalResolver: CustomResolver | undefined,
  twinConfig: NativeTwinServiceNode['Type'],
): CustomResolver => {
  return (context, moduleName, platform) => {
    const resolver = originalResolver ?? context.resolveRequest;
    const resolved = resolver(context, moduleName, platform);

    platform ??= 'native';
    const platformOutput = twinConfig.getPlatformOutput(platform);
    const platformInput = twinConfig.getPlatformInput();

    if ('filePath' in resolved && resolved.filePath === platformInput) {
      return {
        ...resolved,
        filePath: path.resolve(platformOutput),
      };
    }

    return resolved;
  };
};

/** @category Programs */
export const getTransformerOptions = (
  ...[entryPoints, options, getDeps]: Parameters<GetTransformOptions>
) => {
  return Effect.gen(function* () {
    const ctx = yield* MetroConfigService;
    const twin = yield* NativeTwinServiceNode;
    const watcher = yield* TwinFSService;

    const { metroConfig } = ctx;
    const writeStylesToFS = !options.dev;
    const originalGetTransformOptions = metroConfig.transformer.getTransformOptions;

    console.debug(`getTransformOptions.dev ${options.dev}`);
    console.debug(`getTransformOptions.writeStylesToFS ${writeStylesToFS}`);

    // We can skip writing to the filesystem if this instance patched Metro
    if (writeStylesToFS) {
      const platform = options.platform || 'native';
      const outputPath = twin.getPlatformOutput(platform);

      console.debug(`getTransformOptions.platform ${platform}`);
      console.debug(`getTransformOptions.output ${outputPath}`);

      const allFiles = yield* watcher.getAllFilesInProject;
      yield* watcher.runTwinForFiles(allFiles, platform);
    }

    if (!writeStylesToFS && options.platform && !setupPlatforms.has(options.platform)) {
      // setupPlatforms.add(options.platform);
      // yield* watcher.setupPlatform({
      //   projectRoot: ctx.userConfig.projectRoot,
      //   targetPlatform: options.platform ?? 'native',
      // });

      const allFiles = yield* watcher.getAllFilesInProject;
      const platform = options.platform;

      const hasPlatform = setupPlatforms.has(platform);
      const currentSize = setupPlatforms.size;
      if (!hasPlatform) {
        if (currentSize === 0) {
          yield* Effect.log(`Initializing project \n`);
          yield* watcher.runTwinForFiles(allFiles, platform);
          yield* pipe(
            yield* watcher.startWatcher,
            Stream.take(allFiles.length),
            Stream.chunks,
            Stream.runForEach((fs) =>
              watcher.runTwinForFiles(
                Chunk.toArray(fs).map((x) => x.path),
                platform,
              ),
            ),
            Effect.scoped,
            Effect.forkDaemon,
          );
          yield* Effect.yieldNow();
          yield* Effect.log(`Watcher started`);
          setupPlatforms.add(platform);
        }
      }
    }

    const result: Partial<ExtraTransformOptions> = yield* Effect.promise(() =>
      originalGetTransformOptions(entryPoints, options, getDeps),
    );

    // 30146
    // return {
    //   ...result,
    //   transform: {
    //     ...result.transform,
    //     experimentalImportSupport: true,
    //     inlineRequires: true,
    //     unstable_disableES6Transforms: true,
    //   },
    // } as Partial<ExtraTransformOptions>;
    // 32159
    return result;
  });
};
