import connect from 'connect';
import type { ConfigT } from 'metro-config';
// import fs from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import { type RuntimeTW, type TailwindConfig, type __Theme__ } from '@native-twin/core';
import { hasOwnProperty } from '@native-twin/helpers';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type {
  ComposableIntermediateConfigT,
  TwinServerDataBuffer,
} from '../../metro.types';
import { ensureBuffer, matchCss, setupNativeTwin } from '../../utils';
import { debugServerMiddleware, getMetroURLVersion } from './server.utils';

let tw: RuntimeTW | null = null;
const connections = new Set<ServerResponse<IncomingMessage>>();
let currentState: TwinServerDataBuffer = {
  version: 0,
  data: '{}',
};

export const decorateMetroServer = (
  metroConfig: ComposableIntermediateConfigT,
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>,
  config: { cssInput: string; outputFile: string },
): Pick<ConfigT, 'server' | 'resolver'> => {
  const metroServer = metroConfig.server;
  const originalMiddleware = metroServer.enhanceMiddleware;
  const originalResolver = metroConfig.resolver?.resolveRequest;
  return {
    resolver: {
      ...metroConfig.resolver,
      sourceExts: [...(metroConfig.resolver?.sourceExts || []), 'css'],
      resolveRequest(context, moduleName, platform) {
        const resolver = originalResolver ?? context.resolveRequest;
        const resolved = resolver(context, moduleName, platform);

        if (platform === 'web' && 'filePath' in resolved && matchCss(resolved.filePath)) {
          return {
            ...resolved,
            filePath: config.outputFile,
          };
        }

        return resolved;
      },
    },
    server: {
      ...metroServer,
      enhanceMiddleware(middleware, currentServer) {
        let server = connect();

        server.use('/__native_twin_update_endpoint', (req, res, next) => {
          // const url = new URL(req.url!, 'http://localhost');
          // const platform = url.searchParams.get('platform');
          // debugServerMiddleware('SERVER_PLATFORM: ', platform);
          // debugServerMiddleware('SEARCH_PARAMS: ', url.searchParams.entries());
          // debugServerMiddleware('currentState: ', currentState);
          const version = getMetroURLVersion(req.url);
          // const buffer = fs.readFileSync(ctx.twinCacheFile);
          // if (!buffer.equals(ensureBuffer(currentState.data))) {
          //   // debugServerMiddleware('NOT_EQUAL');
          //   currentState.version++;
          //   currentState.data = buffer;
          // }
          // debugServerMiddleware('METRO_VERSION: ', version);
          if (tw && hasOwnProperty.call(tw, 'theme')) {
            // debugServerMiddleware('TW: EXISTS!!');
          }

          if (version && version < currentState.version) {
            // debugServerMiddleware('WRITE_NEW_DATA', JSON.stringify(currentState.data));
            res.write(
              `data: {"version":${currentState.version},"data":${JSON.stringify(currentState.data)}}\n\n`,
            );
            res.end();
            return;
          }
          // currentServer
          //   .getBundler()
          //   .getBundler()
          //   .getDependencyGraph()
          //   .then((graph) => {
          //     graph.
          //   });

          connections.add(res);

          // res.writeHead(200, {
          //   'Content-Type': 'text/event-stream',
          //   'Cache-Control': 'no-cache',
          //   Connection: 'keep-alive',
          // });
          // console.log('SSR_CONN_SIZE: ', connections.size);

          // setTimeout(() => {
          //   res.end();
          //   // console.debug('MIDDLEWARE: timeout');
          //   connections.delete(res);
          // }, 30000);

          req.on('close', () => {
            // console.log('REQ_CLOSED');
            debugServerMiddleware('CLOSE_CONNECTIONS: ', connections.size);
            connections.delete(res);
          });

          next();
        });
        server.use('/', async (req, res, next) => {
          // console.log('REQ_URL: ', req.url);
          const url = new URL(req.url!, 'http://localhost');
          const platform = url.searchParams.get('platform');
          // console.log('SERVER_PLATFORM: ', platform);
          // console.log('SEARCH_PARAMS: ', url.searchParams.entries());
          if (platform) {
            try {
              if (!tw) {
                tw = setupNativeTwin(twConfig, {
                  platform,
                  dev: url.searchParams.get('dev') !== 'false',
                  hot: url.searchParams.get('hot') !== 'true',
                });
              }
            } catch (error) {
              console.log('ERROR: ', error);
              return next(error);
            }
          }

          // res.on('pipe', (a) => {
          //   console.log('PIPE: ', a);
          // });
          // res.writeHead(200, {
          //   'Content-Type': 'text/event-stream',
          //   'Cache-Control': 'no-cache',
          //   Connection: 'keep-alive',
          // });
          // res.write('asdasdasd: asdasdads');

          // req.on('close', () => {
          //   // console.log('REQ_CLOSED');
          //   // debugServerMiddleware('CLOSE_CONNECTIONS: ', connections.size);
          //   connections.delete(res);
          // });
          // res.on('finish', (...args) => {
          //   console.log('REQ: ', args);
          // });

          // req.on('data', (chunk) => {
          //   console.log('REQ_DATA: ', chunk);
          // });

          return next();
        });

        // debugInspect('SERVER_LISTENERS: ', server.eventNames());

        if (originalMiddleware) {
          console.log('ORIGINAL: ', originalMiddleware);
          server = server.use(originalMiddleware(middleware, currentServer));
        }

        return server;
      },
    },
  };
};

export async function sendUpdate(nextData: string | Buffer, _version: number) {
  const buffer = ensureBuffer(nextData);
  const newData: TwinServerDataBuffer = JSON.parse(buffer.toString('utf-8'));
  debugServerMiddleware('SERVER_BUNDLER_PROCESS: ', process.pid)

  currentState = {
    ...currentState,
    version: newData.version,
    // data: JSON.stringify(newData.data),
  };
  // debugServerMiddleware('CONNECTIONS: ', connections.size);
  // debugServerMiddleware('SEND_UPDATE_VERSION: ', currentState.version);

  for (const connection of connections) {
    connection.write(
      `data: {"version":${currentState.version},"data":${JSON.stringify(newData)}}\n\n`,
    );
    connection.end();
  }
}
