import type { IncomingMessage } from 'connect';
import type { ServerResponse } from 'http';
import type { TwinServerDataBuffer } from '../metro.types';
import { ensureBuffer } from '../utils';
import { debugServerMiddleware } from './server.utils';

const connections = new Set<ServerResponse<IncomingMessage>>();
let currentState: TwinServerDataBuffer = {
  version: 0,
  data: '',
};
const shared = new SharedArrayBuffer(1024);

export function sendUpdate(nextData: string | Buffer, _version: number) {
  const buffer = ensureBuffer(nextData);
  const newData: TwinServerDataBuffer = JSON.parse(buffer.toString('utf-8'));
  debugServerMiddleware('SERVER_BUNDLER_PROCESS: ', process.pid)

  currentState = {
    ...currentState,
    version: newData.version,
    data: JSON.stringify(newData.data),
  };
  debugServerMiddleware('CONNECTIONS: ', connections.size);
  debugServerMiddleware('SEND_UPDATE_VERSION: ', currentState.version);
  shared

  for (const connection of connections) {
    connection.write(
      `data: {"version":${currentState.version},"data":${JSON.stringify(newData)}}\n\n`,
    );
    connection.end();
  }
}
