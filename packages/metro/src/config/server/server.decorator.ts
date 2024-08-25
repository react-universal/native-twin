import connect from 'connect';
import type { ConfigT } from 'metro-config';
import { type RuntimeTW, type TailwindConfig, type __Theme__ } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import type { ComposableIntermediateConfigT } from '../../metro.types';
import { setupNativeTwin } from '../../utils';

let tw: RuntimeTW | null = null;

export const decorateMetroServer = (
  metroConfig: ComposableIntermediateConfigT,
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>,
): Pick<ConfigT, 'server'> => {
  const metroServer = metroConfig.server;
  const originalMiddleware = metroServer.enhanceMiddleware;
  return {
    server: {
      ...metroServer,
      enhanceMiddleware(middleware, currentServer) {
        let server = connect();

        server.use('/', async (req, _res, next) => {
          console.log('REQ_URL: ', req.url);
          const url = new URL(req.url!, 'http://localhost');
          const platform = url.searchParams.get('platform');
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
