import connect from 'connect';
import type { ConfigT } from 'metro-config';
import { IncomingMessage, ServerResponse } from 'node:http';
import { setupNativeTwin } from '@native-twin/babel/jsx-babel';
import { type RuntimeTW, type TailwindConfig, type __Theme__ } from '@native-twin/core';
import { ensureBuffer, matchCss } from '@native-twin/helpers/server';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type {
  ComposableIntermediateConfigT,
  TwinServerDataBuffer,
} from '../../metro.types';
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
  config: { cssInput: string; outputFile: string; twinConfigPath: string },
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
          const version = getMetroURLVersion(req.url);

          if (version && version < currentState.version) {
            res.write(
              `data: {"version":${currentState.version},"data":${JSON.stringify(currentState.data)}}\n\n`,
            );
            res.end();
            return;
          }

          connections.add(res);

          req.on('close', () => {
            debugServerMiddleware('CLOSE_CONNECTIONS: ', connections.size);
            connections.delete(res);
          });

          next();
        });
        server.use('/', async (req, res, next) => {
          const url = new URL(req.url!, 'http://localhost');
          const platform = url.searchParams.get('platform');
          if (platform) {
            try {
              if (!tw) {
                tw = setupNativeTwin(twConfig, {
                  platform,
                  engine: 'hermes',
                  isDev: url.searchParams.get('dev') !== 'false',
                  isServer: true,
                  twinConfigPath: config.twinConfigPath,
                });
              }
            } catch (error) {
              console.log('ERROR: ', error);
              return next(error);
            }
          }

          return next();
        });

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
  debugServerMiddleware('SERVER_BUNDLER_PROCESS: ', process.pid);

  currentState = {
    ...currentState,
    version: newData.version,
  };

  for (const connection of connections) {
    connection.write(
      `data: {"version":${currentState.version},"data":${JSON.stringify(newData)}}\n\n`,
    );
    connection.end();
  }
}
