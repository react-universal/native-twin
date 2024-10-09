import * as Array from 'effect/Array';
import * as Cause from 'effect/Cause';
import * as Console from 'effect/Console';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Scope from 'effect/Scope';
import * as Stream from 'effect/Stream';
import * as rollup from 'rollup';
import { inspect } from 'util';
import { TwinCliMainConfig } from '../esbuild-cli/cli.types';
import { createRollupConfig } from './rollup.config';

export class RollupBuild extends Context.Tag('rollup/context')<
  RollupBuild,
  {
    watch: (
      ctx: TwinCliMainConfig['configFile'],
      watch: boolean,
    ) => Effect.Effect<Stream.Stream<string>>;
    build: (
      ctx: TwinCliMainConfig['configFile'],
      watch: boolean,
    ) => Effect.Effect<Stream.Stream<string>, never, never>;
    addFinalizer: Effect.Effect<void, never, Scope.Scope>;
  }
>() {
  static Live = Layer.scoped(
    RollupBuild,
    Effect.gen(function* () {
      const processOutput = (config: rollup.RollupOptions) => {
        return Stream.make(config).pipe(
          Stream.mapEffect((x) => Effect.promise(() => rollup.rollup(x))),
          Stream.mapEffect((x) =>
            pipe(
              Array.ensure(config.output),
              Array.filterMap((output) => Option.fromNullable(output)),
              Array.map((output) => Effect.promise(() => x.write(output))),
              Effect.all,
            ),
          ),
          Stream.flattenIterables,
          Stream.map((x) => x.output),
          Stream.flattenIterables,
          Stream.map((x) =>
            JSON.stringify({
              name: x.name,
              fileName: x.fileName,
              type: x.type,
            }),
          ),
        );
      };
      return {
        addFinalizer: Effect.addFinalizer((exit) =>
          Effect.gen(function* () {
            if (Exit.isSuccess(exit)) {
              yield* Effect.logDebug('Bundler successfully stopped');
            }
            const errorMessage = pipe(
              exit,
              Exit.flatMap((x) => Exit.succeed(x)),
              Exit.causeOption,
              Option.map(Cause.pretty),
              Option.getOrElse(() => false),
            );

            if (errorMessage) {
              yield* Effect.logDebug('Bundler stopped with cause: ', errorMessage);
            }
          }),
        ),
        watch: (configFile, _watch) =>
          Effect.gen(function* () {
            const rollupConfigs = createRollupConfig(configFile);

            yield* Console.debug('[tsup] starting watcher...');

            const events = rollup.watch(rollupConfigs);
            return Stream.async<string>((emit) => {
              events.on('change', async (event) => {
                await emit.fromEffect(
                  Effect.log(`[watch] Detected change in: ${event}`).pipe(
                    Effect.andThen(() => `[watch] Detected change in: ${event}`),
                  ),
                );
                await emit.single(`[watch] Detected change in: ${event}`);
                return;
              });
              events.on('restart', async () => {
                await emit.fromEffect(
                  Effect.log(`[watch] Watcher restarted...`).pipe(
                    Effect.andThen(() => `[watch] Watcher restarted...`),
                  ),
                );
                return;
              });
              events.on('close', async () => {
                await emit.fromEffect(
                  Effect.log(`[watch] Watcher closed.`).pipe(
                    Effect.andThen(() => `[watch] Watcher closed.`),
                  ),
                );
                events.removeAllListeners();
                await events.close();
                await emit.end();
                return;
              });
              events.on('event', async (event) => {
                if (event.code === 'ERROR') {
                  await emit.single(
                    `[watch] Watcher error \n ${inspect(event.error, false, null, true)}.`,
                  );
                }

                return;
              });
              return Effect.void;
            });

            // return pipe(
            //   Stream.fromIterable(rollupConfigs),
            //   Stream.flatMap((x) => processOutput(x)),
            // );

            // return Stream.asyncEffect<string>((_emit) =>
            //   Effect.promise(() => rollup.rollup(rollupConfigs)),
            // );
          }),
        build: (configFile) =>
          Effect.gen(function* () {
            const rollupConfigs = createRollupConfig(configFile);

            return pipe(
              Stream.fromIterable(rollupConfigs),
              Stream.flatMap((x) => processOutput(x)),
            );
            // return Stream.asyncEffect<string>((_emit) =>
            //   Effect.promise(() => rollup.rollup(rollupConfigs)),
            // );
          }),
      };
    }),
  );
}

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
