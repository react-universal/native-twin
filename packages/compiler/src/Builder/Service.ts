import { Ref } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Logger from 'effect/Logger';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';
import * as Stream from 'effect/Stream';
import { TwinCompilerContext, TwinCompilerContextLive } from '../Compiler/Service';
import { TwinFSContext } from '../FileSystem/Service';
import { FSUtils, FSWatcher, TwinPath } from '../internal/fs';
import type { FSFileEvent } from '../internal/fs/fs.watcher';
import type { ImportedTwinConfig } from '../models/Twin.models';
import { CompilerConfigContext } from '../services/CompilerConfig.service';
import {
  TwinNodeContext,
  TwinNodeContextLive,
} from '../services/TwinNodeContext.service';
import { BuildProject } from './Models';

const make = Effect.gen(function* () {
  const ctx = yield* TwinNodeContext;
  const fsWatcher = yield* FSWatcher.FSWatcherContext;
  const watchEvents = yield* fsWatcher.subscribe();
  const env = yield* CompilerConfigContext;
  const { getFullFilePathFromStr } = yield* TwinFSContext;
  const { compileFile } = yield* TwinCompilerContext;
  const watchedFiles = yield* fsWatcher.instance.pipe(Effect.map((x) => x.options));
  yield* Effect.log('WATCHED_FILES: ', watchedFiles);
  const projectRef = yield* Ref.make(new BuildProject());

  const getProject = Ref.get(projectRef);

  return {
    observeTwinConfig,
    observeProjectFiles,
    buildFile,
  };

  function buildFile(platform: string, filename: string, contents?: string) {
    return getFullFilePathFromStr(filename).pipe(
      Effect.andThen((fullPath) => compileFile(platform, fullPath, contents)),
      Effect.tap((module) =>
        getProject.pipe(
          Effect.andThen((project) => project.injectModule(module.module.filename, module)),
        ),
      ),
    );
  }

  function observeProjectFiles(
    onFileEvent?: <A, E>(event: FSFileEvent) => Effect.Effect<A, E>,
  ) {
    const cb = onFileEvent ?? (() => Effect.void);
    return watchEvents.pipe(
      Stream.filterMap(Option.getRight),
      Stream.tap((x) => Effect.log('HUB_FS_EVENT: ', x.path)),
      Stream.tap((event) => cb(event)),
      Stream.flatMap((x) => {
        return Stream.fromEffect(fsWatcher.instance).pipe(
          Stream.map((x) => x.getWatched()),
          Stream.tap((files) => Effect.logDebug('Observing:', Record.keys(files))),
        );
      }),
      Stream.runDrain,
      Effect.tap(() => Effect.log('HUB_FS_EVENT_DRAINED')),
      Logger.withMinimumLogLevel(env.logLevel),
      Effect.forkDaemon,
    );
  }

  function observeTwinConfig(
    onChange?: <A, E>(config: ImportedTwinConfig) => Effect.Effect<A, E>,
  ) {
    const cb = onChange ?? (() => Effect.void);
    return ctx.state.twinConfig.changes.pipe(
      Stream.tap(() => Effect.log('Refreshing twin config...')),
      Stream.runForEach((config) =>
        ctx.onChangeTwinConfigFile().pipe(
          Effect.tap(() => Effect.logDebug('Twin config refreshed')),
          Effect.andThen(() => cb(config)),
        ),
      ),
      Logger.withMinimumLogLevel(env.logLevel),
      Effect.forkDaemon,
    );
  }
});

export interface TwinBuilderContext extends Effect.Effect.Success<typeof make> {}
export const TwinBuilderContext =
  Context.GenericTag<TwinBuilderContext>('TwinBuilderContext');

export const TwinBuilderContextLive = Layer.scoped(TwinBuilderContext, make).pipe(
  Layer.provide(TwinCompilerContextLive),
  Layer.provide(FSUtils.FsUtilsLive),
  Layer.provide(TwinPath.TwinPathLive),
  Layer.provide(FSWatcher.FSWatcherContextLive),
  Layer.provide(TwinNodeContextLive),
);
