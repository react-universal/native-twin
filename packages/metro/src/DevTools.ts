import { DevTools } from '@effect/experimental';
import { NodeSocket } from '@effect/platform-node';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';

export const DevToolsLive = Layer.effectDiscard(Effect.sleep(100)).pipe(
  Layer.provideMerge(DevTools.layerSocket),
  Layer.provide(NodeSocket.layerNet({ port: 34437 })),
  Layer.merge(Logger.pretty),
);
