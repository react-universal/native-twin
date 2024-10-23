import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import * as Path from '@effect/platform/Path';
import * as Layer from 'effect/Layer';
import { TwinFSService, makeFileSystem } from './services/TwinWatcher.service';

const rawLayer = Layer.scoped(TwinFSService, makeFileSystem);

const FSLive = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, Path.layer);

export const twinFileSystemLayer = rawLayer.pipe(Layer.provideMerge(FSLive));

export { TwinFSService };
