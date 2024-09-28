import * as Array from 'effect/Array';
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import * as Tuple from 'effect/Tuple';
import esbuild from 'esbuild';
import pkg from '../package.json';
import * as Configs from './esbuild.config';
import { createEsbuildContext, getEsbuildConfig } from './utils';
import * as Command from '@effect/cli/Command';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import * as CreateCommand from '@effect/platform/Command';
import * as CommandExecutor from '@effect/platform/CommandExecutor';

const twinCli = Command.make('twin-cli', Configs.CommandConfig, (commandConfigs) =>
  Option.match(commandConfigs.config, {
    onNone: () => Console.log("Running 'twinCli'"),
    onSome: (configs) => {
      const keyValuePairs = Array.fromIterable(configs)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ');
      return Console.log(
        `Running 'TwinCli' with the following configs: ${keyValuePairs}`,
      );
    },
  }),
);

const generateTypesCommand = pipe(
  CreateCommand.make('npx', 'tsc', '-p tsconfig.build.json'),
  CreateCommand.workingDirectory(process.cwd()),
  CreateCommand.runInShell(true),
);

const twinBuild = Command.make('build', Configs.BuildConfig, (_buildConfig) =>
  Effect.flatMap(twinCli, (_parentConfig) =>
    Effect.gen(function* () {
      const executor = yield* CommandExecutor.CommandExecutor;
      const ConfigFile = yield* Configs.loadConfigFile(process.cwd());
      const esmConfig = getEsbuildConfig('esm', ConfigFile);
      const commonJSConfig = getEsbuildConfig('cjs', ConfigFile);
      if (ConfigFile.logs) {
        yield* Console.log('CONFIG: ', ConfigFile);
      }

      if (ConfigFile.types) {
        yield* Console.info('Generating types...');
        const typings = yield* pipe(generateTypesCommand, executor.string);
        yield* Console.info('Types Generated! ', typings);
      }

      const contexts = yield* pipe(
        createEsbuildContext(...esmConfig, ...commonJSConfig),
        Effect.all,
      );

      yield* pipe(
        Stream.fromIterable(contexts),
        Stream.mapEffect((x) =>
          Effect.promise(() => x.rebuild()).pipe(Effect.map((y) => Tuple.make(x, y))),
        ),
        Stream.mapEffect(([context, result]) =>
          pipe(
            Effect.promise(() => context.dispose()),
            Effect.flatMap(() =>
              Effect.promise(() =>
                esbuild.analyzeMetafile(result.metafile ?? 'metafile.json'),
              ),
            ),
          ),
        ),
        Stream.runForEach((x) =>
          Effect.if(Effect.succeed(ConfigFile.logs), {
            onFalse: () => Effect.void,
            onTrue: () => Console.info(x),
          }),
        ),
      );
    }),
  ),
);

const command = twinCli.pipe(Command.withSubcommands([twinBuild]));
const cli = Command.run(command, {
  name: 'Twin build',
  version: `v${pkg.version}`,
});

Effect.suspend(() => cli(process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  Effect.tapErrorCause(Effect.logError),
  NodeRuntime.runMain,
);

// cli(process.argv)
//   .pipe(Effect.provide(NodeContext.layer), Effect.runPromiseExit)
//   .catch(console.error);
