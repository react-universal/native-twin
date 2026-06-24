import * as path from 'node:path';
import { createThemeContext } from '@native-twin/core';
import * as RA from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as LogLevel from 'effect/LogLevel';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import * as TwinPath from '../internal/path';
import { CompilerStyleSheet } from '../StyleSheet';
import { createTwinProcessor, extractTwinConfig } from '../utils/twin.utils';
import type { ImportedTwinConfig } from './Models';

export interface CompilerConfig {
  inputCSS: string;
  logLevel: LogLevel.LogLevel;
  outputDir: string;
  projectRoot: string;
  twinConfigPath: Option.Option<string>;
  platformPaths: {
    setupFile: string;
    defaultFile: string;
    web: string;
    ios: string;
    android: string;
    native: string;
  };
}

export class TwinNodeContext extends Effect.Service<TwinNodeContext>()('TwinNodeContext', {
  scoped: Effect.fnUntraced(function* (params: {
    rootDir: string;
    outDir: string;
    twinConfigPath?: string | undefined;
    inputCSS?: string | undefined;
    logLevel?: LogLevel.Literal | undefined;
  }) {
    const env = {
      inputCSS: Option.fromNullable(params.inputCSS).pipe(
        Option.getOrElse(() => path.join(params.outDir, 'twin.in.css')),
      ),
      logLevel: LogLevel.fromLiteral(params.logLevel ?? 'Info'),
      outputDir: params.outDir,
      projectRoot: params.rootDir,
      twinConfigPath: Option.fromNullable(params.twinConfigPath),
      platformPaths: getPlatformOutputs(params.outDir),
    };

    const twinConfigRef = yield* SubscriptionRef.make(extractTwinConfig(env.twinConfigPath));
    const projectFilesRef = yield* SubscriptionRef.make(
      HashSet.fromIterable(yield* getProjectFilesFromConfig(yield* Ref.get(twinConfigRef), 'sync')),
    );

    const runningPlatformsRef = yield* SubscriptionRef.make(HashSet.empty<string>());
    const twThemeContext = yield* twinConfigRef.get.pipe(
      Effect.flatMap((twinConfig) => Ref.make(createThemeContext(twinConfig))),
    );
    const twRunnersRef = yield* Ref.get(twinConfigRef).pipe(
      Effect.flatMap((config) =>
        Ref.make({
          native: new CompilerStyleSheet(
            {
              baseRem: config.root.rem ?? 16,
              platform: 'native',
            },
            createTwinProcessor('native', config) as any,
            true,
          ),
          web: new CompilerStyleSheet(
            {
              baseRem: config.root.rem ?? 16,
              platform: 'web',
            },
            createTwinProcessor('web', config) as any,
            true,
          ),
        }),
      ),
    );

    return {
      env,
      state: {
        twThemeContext,
        projectFiles: {
          ref: projectFilesRef,
          get: SubscriptionRef.get(projectFilesRef),
          changes: projectFilesRef.changes,
        },
        twinConfig: {
          ref: twinConfigRef,
          get: SubscriptionRef.get(twinConfigRef),
          changes: Stream.changes(twinConfigRef.changes),
        },
        runningPlatforms: {
          ref: runningPlatformsRef,
          get: SubscriptionRef.get(runningPlatformsRef),
          changes: Stream.changes(runningPlatformsRef.changes),
        },
        twRunners: {
          get: Ref.get(twRunnersRef),
          ref: twRunnersRef,
        },
      },
      subscribeToConfigScoped,
      isAllowedPath,
      getTwForPlatform,
      getOutputCSSPath,
      getProjectFilesFromConfig,
      onChangeTwinConfigFile,
    };

    function getTwForPlatform(platform: string) {
      return Ref.get(twRunnersRef).pipe(
        Effect.map((runners) => {
          if (platform === 'web') return runners.web;
          return runners.native;
        }),
      );
    }

    function getProjectFilesFromConfig(
      config: ImportedTwinConfig,
      mode: 'sync' | 'async' = 'async',
    ) {
      return Stream.fromIterable(config.content).pipe(
        Stream.map(TwinPath.globPathFromString),
        Stream.runCollect,
        Effect.flatMap((globs) =>
          TwinPath.glob(globs, mode, {
            absolute: true,
            withFileTypes: false,
            cwd: env.projectRoot,
          }),
        ),
        Effect.map((globs) =>
          RA.map(globs, (x) => TwinPath.absolutePathFromString(x, env.projectRoot)),
        ),
      );
    }

    function onChangeTwinConfigFile() {
      return Effect.gen(function* () {
        const twinConfig = extractTwinConfig(env.twinConfigPath);
        const projectFiles = yield* getProjectFilesFromConfig(twinConfig);
        yield* SubscriptionRef.set(projectFilesRef, HashSet.fromIterable(projectFiles));
      }).pipe(Effect.catchAll((e) => Effect.logError('Cant extract twin config file', e)));
    }

    function getOutputCSSPath(platform: string) {
      switch (platform) {
        case 'web':
          return env.platformPaths.web;
        case 'ios':
          return env.platformPaths.ios;
        case 'android':
          return env.platformPaths.android;
        case 'native':
          return env.platformPaths.native;
        default:
          console.warn('[WARN]: cant determine outputCSS fallback to default');
          return env.platformPaths.native;
      }
    }

    function isAllowedPath(filePath: string) {
      return Effect.map(Ref.get(projectFilesRef), (projectFiles) =>
        HashSet.has(projectFiles, TwinPath.absolutePathFromString(filePath, env.projectRoot)),
      );
    }

    function subscribeToConfigScoped(
      onChange: (config: ImportedTwinConfig) => Effect.Effect<void>,
    ) {
      return twinConfigRef.changes.pipe(Stream.runForEach(onChange)).pipe(Effect.forkScoped);
    }
  }),
}) {}

const getPlatformOutputs = (baseDir: string) => ({
  defaultFile: path.posix.join(baseDir, 'twin.out.native.css'),
  web: path.posix.join(baseDir, 'twin.out.web.css'),
  ios: path.posix.join(baseDir, 'twin.out.ios.css.js'),
  android: path.posix.join(baseDir, 'twin.out.android.css.js'),
  native: path.posix.join(baseDir, 'twin.out.native.css.js'),
  setupFile: path.join(baseDir, 'twin.setup.js'),
});

// export const createCompilerConfig = (params: {
//   rootDir: string;
//   outDir: string;
//   twinConfigPath?: string | undefined;
//   inputCSS?: string | undefined;
//   logLevel?: LogLevel.Literal | undefined;
// }): CompilerConfigContext => {
//   return CompilerConfigContext.of({
//     inputCSS: Option.fromNullable(params.inputCSS).pipe(
//       Option.getOrElse(() => path.join(params.outDir, 'twin.in.css')),
//     ),
//     logLevel: LogLevel.fromLiteral(params.logLevel ?? 'Info'),
//     outputDir: params.outDir,
//     projectRoot: params.rootDir,
//     twinConfigPath: Option.fromNullable(params.twinConfigPath),
//     platformPaths: getPlatformOutputs(params.outDir),
//   });
// };
