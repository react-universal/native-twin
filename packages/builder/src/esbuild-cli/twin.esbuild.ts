import * as Tuple from 'effect/Tuple';
import * as Context from 'effect/Context';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import esbuild from 'esbuild';
import type { TwinCliMainConfig } from '../config/config.types';
import { createEsbuildContext, getEsbuildConfig } from './utils';

export interface EsbuildSuccess extends esbuild.BuildResult {}

export class EsbuildError extends Data.TaggedError('EsbuildError')<{
  readonly errors: ReadonlyArray<esbuild.Message>;
}> {}

export class Esbuild extends Context.Tag('esbuild/context')<
  Esbuild,
  {
    watch: (ctx: TwinCliMainConfig['configFile']) => Effect.Effect<Stream.Stream<string>>;
    build: (
      ctx: TwinCliMainConfig['configFile'],
    ) => Effect.Effect<Stream.Stream<string>, never, never>;
  }
>() {
  static Live = Layer.scoped(
    Esbuild,
    Effect.gen(function* () {
      return {
        watch: (configFile) =>
          Effect.gen(function* () {
            const esmConfig = getEsbuildConfig('esm', configFile);
            const commonJSConfig = getEsbuildConfig('cjs', configFile);
            const contexts = yield* Effect.all(
              createEsbuildContext(...esmConfig, ...commonJSConfig),
            );
            return Stream.asyncEffect<string>((emit) => {
              emit.single('[esbuild] starting watcher...');
              return Effect.all(contexts.map((x) => Effect.promise(() => x.watch())));
            });
          }),
        build: (configFile) =>
          Effect.gen(function* () {
            const esmConfig = getEsbuildConfig('esm', configFile);
            const commonJSConfig = getEsbuildConfig('cjs', configFile);
            const contexts = yield* Effect.all(
              createEsbuildContext(...esmConfig, ...commonJSConfig),
            );

            return Stream.fromIterable(contexts).pipe(
              Stream.mapEffect((x) =>
                Effect.promise(() => x.rebuild()).pipe(
                  Effect.map((r) => Tuple.make(x, r)),
                ),
              ),
              Stream.mapEffect((result) =>
                Effect.promise(() =>
                  esbuild.analyzeMetafile(result[1].metafile ?? 'metafile.json', {
                    color: true,
                  }),
                ).pipe(
                  Effect.map((final) => {
                    return Tuple.make(result[0], final);
                  }),
                ),
              ),
              Stream.mapEffect((result) =>
                Effect.promise(() => result[0].dispose()).pipe(
                  Effect.map(() => result[1]),
                ),
              ),
            );
          }),
      };
    }),
  );
}

export const runESBuild = ({ configFile }: TwinCliMainConfig) => {
  return Effect.gen(function* () {
    const esmConfig = getEsbuildConfig('esm', configFile);
    const commonJSConfig = getEsbuildConfig('cjs', configFile);

    const contexts = yield* Effect.all(
      createEsbuildContext(...esmConfig, ...commonJSConfig),
    );

    return pipe(
      Stream.fromIterable(contexts),
      Stream.mapEffect((x) => Effect.promise(() => x.rebuild())),
      Stream.mapEffect((result) =>
        pipe(
          Effect.promise(() =>
            esbuild.analyzeMetafile(result.metafile ?? 'metafile.json', {
              color: true,
            }),
          ),
        ),
      ),
    );
  });
};

// Effect.gen(function* () {
// const decoder = new TextDecoder('utf-8');
// const executor = yield* CommandExecutor.CommandExecutor;
// const ConfigFile = yield* Configs.loadConfigFile(process.cwd());
// const tsCommand = yield* runTsCommand(
//   buildConfig.watch.pipe(Option.getOrElse(() => false)),
// );

// const esbuildCommand = yield* runESBuild(ConfigFile);
// yield* pipe(
//   tsCommand.stdout,
//   Stream.merge(esbuildCommand),
//   Stream.runForEach((x) => Console.log(x)),
//   Stream.runCollect,
// );

// const tsExit = yield* tsCommand.exitCode;
// yield* tsCommand.stderr.pipe(
//   Stream.tap((x) => Console.log(x)),
//   Stream.runCollect,
// );
// const ss = tsCommand.stdin.pipe(Sink.collectAll);
// yield* tsCommand.stdout.pipe(Stream.run(ss));
// yield* Console.log('ts_ex', tsExit);

// yield* pipe(
//   esbuildCommand,
//   Stream.runForEach((x) =>
//     Effect.if(Effect.succeed(ConfigFile.logs), {
//       onFalse: () => Console.debug(x),
//       onTrue: () => Console.info(x),
//     }),
//   ),
//   Stream.runCollect,
// );

// const isRunning = yield* tsCommand.isRunning;
// yield* Console.debug('[TS]: RUNNING: ', isRunning);

// const esmConfig = getEsbuildConfig('esm', ConfigFile);
// const commonJSConfig = getEsbuildConfig('cjs', ConfigFile);
// if (ConfigFile.logs) {
//   yield* Console.log('CONFIG: ', ConfigFile);
// }

// if (ConfigFile.types) {
//   yield* Console.info('Generating types...');

//   const typings = yield* pipe(
//     generateTypesCommand,
//     CreateCommand.runInShell(true),
//     executor.string,
//   );
//   yield* Console.info('Types Generated! ', typings);
// }

// const contexts = yield* pipe(
//   createEsbuildContext(...esmConfig, ...commonJSConfig),
//   Effect.all,
// );

// yield* pipe(
//   Stream.fromIterable(contexts),
//   Stream.mapEffect((x) =>
//     Effect.promise(() => x.rebuild()).pipe(Effect.map((y) => Tuple.make(x, y))),
//   ),
//   Stream.mapEffect(([_context, result]) =>
//     pipe(
//       Effect.promise(() =>
//         esbuild.analyzeMetafile(result.metafile ?? 'metafile.json', {
//           color: true,
//         }),
//       ),
//     ),
//   ),
//   Stream.runForEach((x) =>
//     Effect.if(Effect.succeed(ConfigFile.logs), {
//       onFalse: () => Effect.void,
//       onTrue: () => Console.info(x),
//     }),
//   ),
// );

// if (buildConfig.watch.pipe(Option.getOrElse(() => false))) {
//   const esbuildWatchers = pipe(
//     Stream.fromIterable(contexts),
//     Stream.mapEffect((x) => Effect.promise(() => x.watch())),
//     Stream.onDone(() =>
//       Effect.all(contexts.map((x) => Effect.promise(() => x.dispose()))),
//     ),
//   );

//   // const typescriptWatchers = Stream.make()
//   const typingsWatcher = pipe(
//     generateTypesCommand,
//     CreateCommand.feed('-w'),
//     CreateCommand.runInShell(true),
//     executor.streamLines,
//     Stream.runForEach((x) => Console.log('[TS]: ', x)),
//   );

//   // const a = Stream.asyncScoped<string, PlatformError>((emit) => {
//   //   return Effect.acquireRelease(
//   //     pipe(

//   //     ),
//   //     () => Effect.log('adsasd'),
//   //   );
//   // });
//   yield* pipe(
//     Stream.mergeAll([typingsWatcher, esbuildWatchers], {
//       concurrency: 'unbounded',
//     }),
//     Stream.runForEach(() => Console.log('[Global]: watching files...')),
//     Stream.runCollect,
//   );
// }

// if (!Option.getOrElse(buildConfig.watch, () => false)) {
//   yield* Console.log('INTERRUPT: ');
//   yield* Effect.interrupt;
// }
// }).pipe(Effect.scoped),
