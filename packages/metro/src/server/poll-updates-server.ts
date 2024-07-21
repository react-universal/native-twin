import type { IncomingMessage } from 'connect';
import createServer from 'connect';
import type { ServerResponse } from 'http';
import { TwinServerDataBuffer } from '../types/metro.types';
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
      console.log('WRITE_RES', currentState.data);
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
  console.log('SEND_DATA: ', version);

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

// function getDiff(current: any, previous: any) {
//   return JSON.stringify({
//     $$compiled: true,
//     flags: current.flags,
//     rem: current.rem,
//     rules: current.rules?.filter((rule: any) => {
//       const match = previous.rules?.find((r: any) => r[0] === rule[0]);
//       return match ? !deepEqual(rule, match) : true;
//     }),
//     keyframes: current.keyframes?.filter((keyframe: any) => {
//       const match = previous.keyframes?.find((r: any) => r[0] === keyframe[0]);
//       return match ? !deepEqual(keyframe, match) : true;
//     }),
//   });
// }

// function deepEqual(obj1: any, obj2: any) {
//   if (obj1 === obj2) {
//     // it's just the same object. No need to compare.
//     return true;
//   }

//   //check if value is primitive
//   if (obj1 !== Object(obj1) && obj2 !== Object(obj2)) {
//     // compare primitives
//     return obj1 === obj2;
//   }

//   if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

//   // compare objects with same number of keys
//   for (const key in obj1) {
//     if (!(key in obj2)) return false; //other object doesn't have this prop
//     if (!deepEqual(obj1[key], obj2[key])) return false;
//   }

//   return true;
// }
