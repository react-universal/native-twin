import connect from 'connect';
import fs from 'fs';
import type { ConfigT } from 'metro-config';
import type { FileSystem } from 'metro-file-map';
import type MetroServer from 'metro/src/Server';
import micromatch from 'micromatch';
import path from 'path';
import { type RuntimeTW, type TailwindConfig, type __Theme__ } from '@native-twin/core';
import type { TailwindPresetTheme } from '@native-twin/preset-tailwind';
import { MetroConfigContextShape } from '../../cli/MetroCli.service';
import type { ComposableIntermediateConfigT } from '../../metro.types';
import { setupNativeTwin } from '../../utils';

let haste: any;
const virtualModules = new Map<string, Promise<Buffer>>();

let tw: RuntimeTW | null = null;

export const decorateMetroServer = (
  metroConfig: ComposableIntermediateConfigT,
  twConfig: TailwindConfig<__Theme__ & TailwindPresetTheme>,
  ctx: MetroConfigContextShape,
): Pick<ConfigT, 'server' | 'resolver'> => {
  const metroServer = metroConfig.server;
  const originalMiddleware = metroServer.enhanceMiddleware;
  const originalResolver = metroConfig?.resolver.resolveRequest;
  return {
    resolver: {
      ...metroConfig.resolver,
      resolveRequest(context, moduleName, platform) {
        // console.log('RESOLVE: ', module);
        platform = platform || 'native';

        const resolvedModule =
          originalResolver?.(context, moduleName, platform) ||
          context.resolveRequest(context, moduleName, platform);

        if (
          resolvedModule.type === 'sourceFile' &&
          resolvedModule.filePath.includes('globals.css')
        ) {
          const platformFilePath = ctx.twinCacheFile;
          initPreprocessedFile(platformFilePath, platform, ctx.dev, ctx.twinCacheFile);
          return {
            ...resolvedModule,
            filePath: platformFilePath,
          };
        }

        if (
          resolvedModule.type === 'sourceFile' &&
          !micromatch.isMatch(path.resolve(resolvedModule.filePath), ctx.allowedPaths)
        ) {
          // console.log('NOT_ALLOWED', resolvedModule.filePath, '\n');
          return resolvedModule;
        }

        if (resolvedModule.type !== 'sourceFile') return resolvedModule;

        // if (
        //   resolvedModule.type === 'sourceFile' &&
        //   resolvedModule.filePath.includes(TWIN_CACHE_DIR)
        // ) {
        //   console.log('TWIN_FILE: ', resolvedModule.filePath);
        //   const platformFilePath = `${resolvedModule.filePath.replace('.js', '')}.${platform}.js`;
        //   initPreprocessedFile(platformFilePath, platform, ctx.dev, ctx.twinCacheFile);
        //   return {
        //     ...resolvedModule,
        //     filePath: platformFilePath,
        //   };
        // }

        return context.resolveRequest(context, moduleName, platform);
      },
    },
    server: {
      ...metroServer,
      forwardClientLogs: true,
      enhanceMiddleware(middleware, metroServer) {
        const server = connect();

        const bundler = metroServer.getBundler().getBundler();
        const initPromise = bundler.getDependencyGraph().then(async (graph: any) => {
          haste = graph._haste;
          ensureFileSystemPatched(graph._fileSystem);
          ensureBundlerPatched(bundler);
        });

        server.use(async (_, __, next) => {
          await initPromise;
          next();
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
                });
              }
            } catch (error) {
              return next(error);
            }
          }

          next();
        });

        // debugInspect('SERVER_LISTENERS: ', server.eventNames());

        return originalMiddleware
          ? server.use(originalMiddleware(middleware, metroServer))
          : server.use(middleware);
      },
    },
  };
};

/**
 * Patch the Metro File system to new cache virtual modules
 */
function ensureFileSystemPatched(
  fs: FileSystem & {
    getSha1: {
      __twin_runtime__patched?: boolean;
    };
  },
) {
  if (!fs.getSha1.__twin_runtime__patched) {
    const original_getSha1 = fs.getSha1.bind(fs);
    fs.getSha1 = (filename) => {
      if (virtualModules.has(filename)) {
        // Don't cache this file. It should always be fresh.
        return `${filename}-${Date.now()}`;
      }
      return original_getSha1(filename);
    };
    fs.getSha1.__twin_runtime__patched = true;
  }

  return fs;
}

async function initPreprocessedFile(
  filePath: string,
  platform: string,
  dev: boolean,
  cssOutput: string,
) {
  if (virtualModules.has(cssOutput)) {
    return;
  }
  console.log('VIRTUAL: ', virtualModules);

  virtualModules.set(
    filePath,
    (() => {
      haste.emit('change', {
        eventsQueue: [
          {
            filePath,
            metadata: {
              modifiedTime: Date.now(),
              size: 1, // Can be anything
              type: 'virtual', // Can be anything
            },
            type: 'change',
          },
        ],
      });

      return Promise.resolve(getNativeJS(fs.readFileSync(cssOutput, 'utf-8'), dev));
    })(),
  );
}

/**
 * Patch the bundler to use virtual modules
 */
function ensureBundlerPatched(
  bundler: ReturnType<ReturnType<MetroServer['getBundler']>['getBundler']> & {
    transformFile: { __twin_runtime__patched?: boolean };
  },
) {
  if (bundler.transformFile.__twin_runtime__patched) {
    return;
  }

  const originalTransformFile = bundler.transformFile.bind(bundler);

  bundler.transformFile = async function (filePath, transformOptions, fileBuffer) {
    const virtualModule = virtualModules.get(filePath);
    if (virtualModule) {
      fileBuffer = await virtualModule;
    }

    return originalTransformFile(filePath, transformOptions, fileBuffer);
  };
  bundler.transformFile.__twin_runtime__patched = true;
}

const getNativeJS = (data = '', dev = false) => {
  let output = `
 "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
${data}

`;

  if (dev) {
    output += `
/**
 * This is a hack for Expo Router. It's _layout files export 'unstable_settings' which break Fast Refresh
 * Expo Router only supports Metro as a bundler
 */
if (typeof __METRO_GLOBAL_PREFIX__ !== "undefined" && global[__METRO_GLOBAL_PREFIX__ + "__ReactRefresh"]) {
  const Refresh = global[__METRO_GLOBAL_PREFIX__ + "__ReactRefresh"]
  const isLikelyComponentType = Refresh.isLikelyComponentType
  const expoRouterExports = new WeakSet()
  Object.assign(Refresh, {
    isLikelyComponentType(value) {
      if (typeof value === "object" && "unstable_settings" in value) {
        expoRouterExports.add(value.unstable_settings)
      }

      if (typeof value === "object" && "ErrorBoundary" in value) {
        expoRouterExports.add(value.ErrorBoundary)
      }

      // When ErrorBoundary is exported, the inverse dependency will also include the _ctx file. So we need to account for it as well
      if (typeof value === "object" && "ctx" in value && value.ctx.name === "metroContext") {
        expoRouterExports.add(value.ctx)
      }

      return expoRouterExports.has(value) || isLikelyComponentType(value)
    }
  })
}
`;
  }

  return Buffer.from(output);
};
