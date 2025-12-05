import * as Layer from 'effect/Layer';
import * as ManagedRuntime from 'effect/ManagedRuntime';
import { MonacoFsLive } from './FS.service';
import { MonacoContextLive } from './Monaco.service';

export const MainLayer = MonacoContextLive.pipe(Layer.provideMerge(MonacoFsLive));

export const MonacoRuntime = ManagedRuntime.make(MainLayer);
