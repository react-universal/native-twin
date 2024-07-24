import type { IncomingMessage } from 'connect';
import type createServer from 'connect';
import type { ServerResponse } from 'http';
import type { TwinServerDataBuffer } from '../types/metro.types';
import { METRO_ENDPOINT } from '../utils/constants';

const connections = new Set<ServerResponse<IncomingMessage>>();
const currentState: TwinServerDataBuffer = {
  version: 1,
  data: '',
  rem: 12,
};

export const createTwinServerMiddleware: [string, createServer.NextHandleFunction] = [
  `/${METRO_ENDPOINT}`,
  (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    const version = parseInt(req.url?.split('?version=')[1] ?? '0');
    console.log('MIDDLEWARE: request-Version: ', req.url?.split('?version=')[1]);
    console.log('MIDDLEWARE: state-Version: ', currentState.version);

    if (version && version < currentState.version) {
      res.write(
        `data: {"version":${currentState.version},"data":${JSON.stringify(currentState.data)}}\n\n`,
      );
      res.end();
      return;
    }

    connections.add(res);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    });

    setTimeout(() => {
      res.end();
      connections.delete(res);
    }, 30000);

    req.on('close', () => connections.delete(res));
  },
];

export function sendUpdate(nextData: string, version: number) {
  const newData: TwinServerDataBuffer = JSON.parse(nextData);

  currentState.version = ++version;
  currentState.data = JSON.stringify(newData.data);
  // last.json = newJson;

  for (const connection of connections) {
    connection.write(
      `data: {"version":${currentState.version},"data":${JSON.stringify(newData)}}\n\n`,
    );
    connection.end();
  }
}
