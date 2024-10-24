// import * as Effect from 'effect/Effect';
// import type { GetTransformOptions } from 'metro-config';
// import { NativeTwinService } from '@native-twin/babel/services';
// import { MetroConfigService } from '@native-twin/compiler/metro';
// import { TwinWatcherService } from '../TwinWatcher.service';

// const alreadySetup: Set<string> = new Set();
// /** @category Programs */
// export const getTransformerOptions = (
//   projectRoot: string,
//   ...[entryPoints, options, getDeps]: Parameters<GetTransformOptions>
// ) =>
//   Effect.gen(function* () {
//     const ctx = yield* MetroConfigService;
//     const watcher = yield* TwinWatcherService;

//     const { metroConfig } = ctx;
//     const originalGetTransformOptions = metroConfig.transformer.getTransformOptions;

//     const result = yield* Effect.promise(() =>
//       originalGetTransformOptions(entryPoints, options, getDeps),
//     );

//     if (options.platform && !alreadySetup.has(options.platform)) {
//       alreadySetup.add(options.platform);
//       yield* watcher.setupPlatform({
//         projectRoot: ctx.userConfig.projectRoot,
//         targetPlatform: options.platform ?? 'native',
//       });
//     }

//     return result;
//   }).pipe(
//     Effect.provide(
//       NativeTwinService.make({
//         dev: options.dev,
//         platform: options.platform ?? 'native',
//         projectRoot,
//       }),
//     ),
//   );
