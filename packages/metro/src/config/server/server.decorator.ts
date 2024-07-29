import connect from 'connect';
import type { IncomingMessage } from 'connect';
import fs from 'fs';
import type { ServerResponse } from 'http';
import type { ServerConfigT } from 'metro-config';
import { type RuntimeTW, type TailwindConfig, type __Theme__ } from '@native-twin/core';
import { hasOwnProperty } from '@native-twin/helpers';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type {
  ComposableIntermediateConfigT,
  TwinServerDataBuffer,
} from '../../metro.types';
import { ensureBuffer, setupNativeTwin } from '../../utils';
import { debugServerMiddleware, getMetroURLVersion } from './server.utils';

const connections = new Set<ServerResponse<IncomingMessage>>();
// let haste: any;
// let fileSystem: any;
// const virtualModules = new Map<string, Promise<Buffer>>();

const currentState: TwinServerDataBuffer = {
  version: 0,
  data: '{}',
};
let tw: RuntimeTW | null = null;

export const decorateMetroServer = (
  metroConfig: ComposableIntermediateConfigT,
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>,
  cssOut: string,
): ServerConfigT => {
  const metroServer = metroConfig.server;
  const originalMiddleware = metroServer.enhanceMiddleware;
  return {
    ...metroServer,
    forwardClientLogs: true,
    enhanceMiddleware(middleware, metroServer) {
      let server = connect();

      // const bundler = metroServer.getBundler().getBundler();
      // const initPromise = bundler.getDependencyGraph().then(async (_graph: any) => {
      //   // haste = graph._haste;
      //   // fileSystem = graph._fileSystem;
      // });

      server.use('/__native_twin_update_endpoint', (req, res) => {
        debugServerMiddleware('currentState: ', currentState);
        const version = getMetroURLVersion(req.url);
        const buffer = fs.readFileSync(cssOut);
        if (!buffer.equals(ensureBuffer(currentState.data))) {
          // debugServerMiddleware('NOT_EQUAL');
          currentState.version++;
          currentState.data = buffer;
        }
        debugServerMiddleware('METRO_VERSION: ', version);
        if (tw && hasOwnProperty.call(tw, 'theme')) {
          // console.log('TW: EXISTS!!');
        }

        if (version && version < currentState.version) {
          debugServerMiddleware('WRITE_NEW_DATA', JSON.stringify(currentState.data));
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
        // console.log('SSR_CONN_SIZE: ', connections.size);

        setTimeout(() => {
          res.end();
          // console.debug('MIDDLEWARE: timeout');
          connections.delete(res);
        }, 30000);

        req.on('close', () => {
          // console.log('REQ_CLOSED');
          connections.delete(res);
        });
      });
      server.use('/', async (req, _res, next) => {
        const url = new URL(req.url!, 'http://localhost');
        const platform = url.searchParams.get('platform');
        if (platform) {
          try {
            if (!tw) {
              tw = setupNativeTwin(twConfig, {
                platform,
                dev: url.searchParams.get('dev') !== 'false',
                hot: url.searchParams.get('hot') !== 'true',
              }).tw;
            }
          } catch (error) {
            return next(error);
          }
        }

        next();
      });

      // debugInspect('SERVER_LISTENERS: ', server.eventNames());

      if (originalMiddleware) {
        server = server.use(originalMiddleware(middleware, metroServer));
      }

      return server;
    },
  };
};
