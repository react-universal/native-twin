import { Path } from '@effect/platform';
import { NodePath } from '@effect/platform-node';
import {
  CompilerConfigContext,
  createCompilerConfig,
  MainLayer,
  type NodeWithNativeTwinOptions,
  TwinFSContextLive,
  TwinNodeContextLive,
} from '@native-twin/compiler';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

export const MetroMainLayer = Layer.empty.pipe(
  Layer.provideMerge(TwinNodeContextLive),
  // Layer.provideMerge(BabelCompilerContextLive),
);
export const MetroLayerWithTwinFS = MainLayer.pipe(
  Layer.provideMerge(MetroMainLayer),
  // Layer.provideMerge(TwinPath.),
  // Layer.provideMerge(FSUtils.FsUtilsLive),
  // Layer.provideMerge(TwinPath.),
);
export const MetroLayerWithTwinWatcher = MetroLayerWithTwinFS.pipe(
  Layer.provideMerge(TwinFSContextLive),
  Layer.provideMerge(MetroMainLayer),
  // Layer.provideMerge(TwinWatcherContextLive),
);

export const createMetroInnerLayer = (nativeTwinConfig: NodeWithNativeTwinOptions) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const outDir =
      nativeTwinConfig.outputDir ??
      path.join(path.dirname(require.resolve('@native-twin/core')), '../..', '.cache');

    return MetroMainLayer.pipe(
      Layer.provideMerge(
        Layer.succeed(
          CompilerConfigContext,
          CompilerConfigContext.of(
            createCompilerConfig({
              rootDir: nativeTwinConfig.projectRoot ?? process.cwd(),
              outDir,
              inputCSS: nativeTwinConfig.inputCSS,
              twinConfigPath: nativeTwinConfig.twinConfigPath,
            }),
          ),
        ),
      ),
    );
  }).pipe(Layer.unwrapEffect, Layer.provide(NodePath.layerPosix));
