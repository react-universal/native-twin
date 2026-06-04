import * as Layer from 'effect/Layer';
import { BabelUtils } from '../Babel';
import { TwinNodeContextLive } from '../Config';
import { TwinFSContextLive } from '../FileSystem';
import { TwinProjectContextLive } from '../Project';
import { TwinStyleSheetContextLive } from '../StyleSheet';

export const MainLayer = TwinProjectContextLive.pipe(
  Layer.provideMerge(TwinStyleSheetContextLive),
  Layer.provideMerge(BabelUtils.Default),
  Layer.provideMerge(TwinFSContextLive),
  Layer.provideMerge(TwinNodeContextLive),
);
