import { Path } from '@effect/platform';
import { NodePath } from '@effect/platform-node';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { type NodeWithNativeTwinOptions, TwinNodeContext } from '../Config';
import { TwinProjectContextLive } from '../Project';

export const createMetroInnerLayer = (nativeTwinConfig: NodeWithNativeTwinOptions) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const outDir =
      nativeTwinConfig.outputDir ??
      path.join(path.dirname(require.resolve('@native-twin/core')), '../..', '.cache');

    return TwinProjectContextLive.pipe(
      Layer.provideMerge(
        TwinNodeContext.Default({
          rootDir: nativeTwinConfig.projectRoot ?? process.cwd(),
          outDir,
          inputCSS: nativeTwinConfig.inputCSS,
          twinConfigPath: nativeTwinConfig.twinConfigPath,
        }),
      ),
    );
  }).pipe(Layer.unwrapEffect, Layer.provide(NodePath.layerPosix));
