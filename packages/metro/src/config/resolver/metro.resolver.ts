// import type { ResolverConfigT } from 'metro-config';
// import micromatch from 'micromatch';
// import path from 'path';
// import type { MetroConfigInternal } from '../../metro.types';

// let haste: any;
// const virtualModules = new Map<string, Promise<Buffer>>();

// export const createMetroResolver = (
//   metroConfig: ResolverConfigT,
//   config: MetroConfigInternal,
//   allowedPaths: string[],
// ): ResolverConfigT => {
//   const originalResolver = metroConfig?.resolveRequest;

//   return {
//     ...metroConfig,
//     sourceExts: [...metroConfig.sourceExts, 'css'],
    
//   };
// };

// async function initPreprocessedFile(
//   filePath: string,
//   platform: string,
//   { input, getPlatformCSS, ...options }: WithCssInteropOptions,
//   dev: boolean,
// ) {
//   if (virtualModules.has(filePath)) {
//     return;
//   }

//   virtualModules.set(
//     filePath,
//     getPlatformCSS(
//       platform,
//       dev,
//       // This should only be called in development when a file changes
//       (css: string) => {
//         virtualModules.set(
//           filePath,
//           Promise.resolve(
//             platform === 'web'
//               ? Buffer.from(css)
//               : getNativeJS(cssToReactNativeRuntime(css, options), dev),
//           ),
//         );

//         haste.emit('change', {
//           eventsQueue: [
//             {
//               filePath,
//               metadata: {
//                 modifiedTime: Date.now(),
//                 size: 1, // Can be anything
//                 type: 'virtual', // Can be anything
//               },
//               type: 'change',
//             },
//           ],
//         });
//       },
//     ).then((css) => {
//       return platform === 'web'
//         ? Buffer.from(css)
//         : getNativeJS(cssToReactNativeRuntime(css, options), dev);
//     }),
//   );
// }

// const getNativeJS = (data = {}, dev = false) => {
//   let output = `
//  "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// const __inject_1 = require("react-native-css-interop/dist/runtime/native/styles");
// (0, __inject_1.injectData)(${JSON.stringify(data)}); 
// `;

//   if (dev) {
//     output += `
// /**
//  * This is a hack for Expo Router. It's _layout files export 'unstable_settings' which break Fast Refresh
//  * Expo Router only supports Metro as a bundler
//  */
// if (typeof __METRO_GLOBAL_PREFIX__ !== "undefined" && global[__METRO_GLOBAL_PREFIX__ + "__ReactRefresh"]) {
//   const Refresh = global[__METRO_GLOBAL_PREFIX__ + "__ReactRefresh"]
//   const isLikelyComponentType = Refresh.isLikelyComponentType
//   const expoRouterExports = new WeakSet()
//   Object.assign(Refresh, {
//     isLikelyComponentType(value) {
//       if (typeof value === "object" && "unstable_settings" in value) {
//         expoRouterExports.add(value.unstable_settings)
//       }

//       if (typeof value === "object" && "ErrorBoundary" in value) {
//         expoRouterExports.add(value.ErrorBoundary)
//       }

//       // When ErrorBoundary is exported, the inverse dependency will also include the _ctx file. So we need to account for it as well
//       if (typeof value === "object" && "ctx" in value && value.ctx.name === "metroContext") {
//         expoRouterExports.add(value.ctx)
//       }

//       return expoRouterExports.has(value) || isLikelyComponentType(value)
//     }
//   })
// }
// `;
//   }

//   return Buffer.from(output);
// };
