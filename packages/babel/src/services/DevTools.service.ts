import * as DevTools from '@effect/experimental/DevTools';
import * as NodeSocket from '@effect/platform-node/NodeSocket';
import * as Layer from 'effect/Layer';

export const DevToolsLive = DevTools.layerWebSocket().pipe(
  Layer.provide(NodeSocket.layerWebSocketConstructor),
);
