import { FileSystem, Path } from '@effect/platform';
import { NodeFileSystem, NodePath } from '@effect/platform-node';
import * as ParcelWatcher from '@effect/platform-node/NodeFileSystem/ParcelWatcher';
import { Array, Effect, Layer, pipe, Stream } from 'effect';
import { getDocumentLanguageLocations } from '@native-twin/language-service';
import { MetroConfigService } from '../services/MetroConfig.service';
import { mappedComponents } from '../utils';

const FileSystemLive = NodeFileSystem.layer.pipe(Layer.provide(ParcelWatcher.layer));

export const startScanning = Effect.gen(function* () {
  const { userConfig, isAllowedPath } = yield* MetroConfigService;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const attributes = pipe(
    mappedComponents,
    Array.flatMap((x) => Object.keys(x.config)),
    Array.dedupe,
  );

  const watchPaths = pipe(
    userConfig.allowedPaths,
    Array.map((x) => path.dirname(x)),
    Array.dedupe,
    Stream.fromIterable,
    Stream.flatMap(fs.watch),
  );
  return yield* watchPaths.pipe(
    Stream.map((watchEvent) => ({
      ...watchEvent,
      path: path.resolve(userConfig.projectRoot, watchEvent.path),
    })),
    Stream.filter((watchEvent) => {
      console.log('FILTER_EVENT: ', watchEvent.path);
      return isAllowedPath(watchEvent.path);
    }),
    Stream.runForEach((watcher) =>
      Effect.gen(function* () {
        const fileContent = yield* fs.readFileString(watcher.path, 'utf-8');
        const regions = yield* Effect.sync(() =>
          getDocumentLanguageLocations(fileContent, {
            attributes,
            tags: [
              'tw',
              'apply',
              'css',
              'variants',
              'styled',
              'tx',
              'style',
              'createVariants',
            ],
          }),
        );
        console.log('REGIONS: ', regions);
        return watcher.path;
      }),
    ),
  );
}).pipe(Effect.provide(FileSystemLive), Effect.provide(NodePath.layer));
