import connect from 'connect';
import type { ConfigT } from 'metro-config';
import path from 'path';
// import path from 'path';
import { InternalTwinConfig, setupNativeTwin } from '@native-twin/babel/jsx-babel';
import { TailwindConfig, type RuntimeTW, type __Theme__ } from '@native-twin/core';
import { matchCss } from '@native-twin/helpers/server';
// import { matchCss } from '@native-twin/helpers/server';
import type { ComposableIntermediateConfigT } from '../../metro.types';
import { MetroConfigService } from '../../services/MetroConfig.service';

let tw: RuntimeTW | null = null;

export const decorateMetroServer = (
  metroConfig: ComposableIntermediateConfigT,
  twinConfig: TailwindConfig<InternalTwinConfig>,
  { outputCSS, twinConfigPath, projectRoot }: MetroConfigService['Type']['userConfig'],
): Pick<ConfigT, 'server' | 'resolver'> => {
  const metroServer = metroConfig.server;
  const originalMiddleware = metroServer.enhanceMiddleware;
  const originalResolver = metroConfig.resolver?.resolveRequest;
  return {
    resolver: {
      ...metroConfig.resolver,
      // sourceExts: [...metroConfig.resolver.sourceExts, 'css'],
      resolveRequest(context, moduleName, platform) {
        const resolver = originalResolver ?? context.resolveRequest;
        const resolved = resolver(context, moduleName, platform);

        if (platform === 'web' && 'filePath' in resolved && matchCss(resolved.filePath)) {
          console.log('RESOLVED_CSS: ', resolved);
          return {
            ...resolved,
            filePath: path.resolve(outputCSS),
          };
        }

        return resolved;
      },
    },
    server: {
      ...metroServer,
      enhanceMiddleware(middleware, currentServer) {
        let server = connect();

        server.use('/', async (req, res, next) => {
          const url = new URL(req.url!, 'http://localhost');
          const platform = url.searchParams.get('platform');
          if (platform) {
            try {
              if (!tw) {
                tw = setupNativeTwin(twinConfig, {
                  platform,
                  engine: 'hermes',
                  isDev: url.searchParams.get('dev') !== 'false',
                  isServer: true,
                  twinConfigPath,
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
