import connect from 'connect';
import { ServerConfigT } from 'metro-config';
import { TailwindConfig, __Theme__ } from '@native-twin/core';
import { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { setupNativeTwin } from '../utils/load-config';
import { createTwinServerMiddleware } from './poll-updates-server';

export const decorateMetroServer = (
  metroServer: ServerConfigT,
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>,
): ServerConfigT => {
  // This is marked as deprecated, Expo SDK HEAVY RELIES on this, so its not going anywhere anytime soon
  const enhanceMiddleware = metroServer.enhanceMiddleware;
  return {
    ...metroServer,
    enhanceMiddleware(middleware, metroServer) {
      let server = connect()
        .use(createTwinServerMiddleware[0], createTwinServerMiddleware[1])
        .use('/', async (req, _res, next) => {
          const url = new URL(req.url!, 'http://localhost');
          const platform = url.searchParams.get('platform');
          if (platform) {
            try {
              setupNativeTwin(twConfig, {
                platform,
                dev: url.searchParams.get('dev') !== 'false',
                hot: url.searchParams.get('hot') !== 'true',
              });
            } catch (error) {
              return next(error);
            }
          }

          next();
        });

      if (enhanceMiddleware) {
        server = server.use(enhanceMiddleware(middleware, metroServer));
      }

      return server;
    },
  };
};
