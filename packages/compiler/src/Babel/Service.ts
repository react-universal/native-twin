import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { TwinNodeContextLive } from '../Config';
import {
  TwinFSContext,
  TwinFSContextLive,
  type TwinFile,
  type TwinPath,
} from '../FileSystem';
import { fromTwinFile } from './models/TwinBabelModule';

const make = Effect.gen(function* () {
  const fs = yield* TwinFSContext;

  return {
    getBabelModule: (file: TwinFile) => fromTwinFile(file),
    moduleFromFilePath,
  };

  function moduleFromFilePath(path_: TwinPath.FilePath) {
    return fs.getFile(path_).pipe(
      Effect.andThen((file) => fromTwinFile(file)),
      Effect.tapError((error) => Effect.logDebug('ERROR_GETTING_MODULE: ', error._tag)),
    );
  }
});

export interface BabelContext extends Effect.Effect.Success<typeof make> {}
export const BabelContext = Context.GenericTag<BabelContext>('BabelContext');

export const BabelContextLive = Layer.effect(BabelContext, make).pipe(
  Layer.provide(TwinNodeContextLive),
  Layer.provide(TwinFSContextLive),
);
