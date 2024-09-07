import { DevTools } from '@effect/experimental';
// import { NodeSocket } from '@effect/platform-node';
// import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';

export const DevToolsLive = Layer.empty.pipe(
  Layer.provideMerge(DevTools.layer()),
  // Layer.provide(NodeSocket.layerNet({ port: 34437, localPort: 8082 })),
  Layer.merge(Logger.pretty),
);
