import type { ResolverConfigT } from 'metro-config';
import path from 'path';
import { MetroConfigService } from '@native-twin/compiler/metro';

let haste: any;
const virtualModules = new Map<string, Promise<Buffer>>();

export const createMetroResolver = (
  metroResolver: ResolverConfigT,
  twinConfig: MetroConfigService['Type'],
): ResolverConfigT => {
  const originalResolver = metroResolver.resolveRequest;

  return {
    ...metroResolver,
    sourceExts: [...metroResolver.sourceExts],
    resolveRequest(context, moduleName, platform) {
      const resolver = originalResolver ?? context.resolveRequest;
      const resolved = resolver(context, moduleName, platform);

      if (
        'filePath' in resolved &&
        path.basename(resolved.filePath) === path.basename(twinConfig.userConfig.inputCSS)
      ) {
        return {
          ...resolved,
          type: 'sourceFile',
          filePath: path.resolve(twinConfig.userConfig.outputCSS),
        };
      }

      return resolved;
    },
  };
};

export async function initPreprocessedFile(
  filePath: string,
  platform: string,
  { input, getPlatformCSS, ...options }: any,
  dev: boolean,
) {
  if (virtualModules.has(filePath)) {
    return;
  }

  virtualModules.set(
    filePath,
    getPlatformCSS(
      platform,
      dev,
      // This should only be called in development when a file changes
      (css: string) => {
        virtualModules.set(
          filePath,
          Promise.resolve(
            Buffer.from(css),
            // platform === 'web'
            //   ? Buffer.from(css)
            //   : getNativeJS(cssToReactNativeRuntime(css, options), dev),
          ),
        );

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
      },
    ).then((css: string) => {
      return Buffer.from(css);
      // platform === 'web'
      //   ? Buffer.from(css)
      //   : getNativeJS(cssToReactNativeRuntime(css, options), dev);
    }),
  );
}

export const getNativeJS = (data = {}, dev = false) => {
  let output = `
 "use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __inject_1 = require("react-native-css-interop/dist/runtime/native/styles");
(0, __inject_1.injectData)(${JSON.stringify(data)}); 
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
