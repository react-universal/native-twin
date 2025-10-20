import * as Layer from 'effect/Layer';
import { BabelContextLive } from '../Babel';
import { TwinNodeContextLive } from '../Config';
import { TwinFSContextLive } from '../FileSystem';
import { TwinProjectContextLive } from '../Project';
import { TwinStyleSheetContextLive } from '../StyleSheet';

export const MainLayer = TwinProjectContextLive.pipe(
  Layer.provideMerge(TwinStyleSheetContextLive),
  Layer.provideMerge(BabelContextLive),
  Layer.provideMerge(TwinFSContextLive),
  Layer.provideMerge(TwinNodeContextLive),
);
