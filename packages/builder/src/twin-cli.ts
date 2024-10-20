import * as CliCommand from '@effect/cli/Command';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import pkg from '../package.json';
import * as CliConfigs from './config/cli.config';
import { BuilderConfig } from './config/config.context';
import { rollupBuild, RollupLayer } from './rollup';
import * as TwinLogger from './utils/logger';

const twinCli = CliCommand.make('twin-cli', CliConfigs.CommandConfig).pipe(
  CliCommand.withDescription('Twin Cli'),
);

const twinBuild = CliCommand.make('build', CliConfigs.BuildConfig).pipe(
  CliCommand.withHandler(() => rollupBuild),
  CliCommand.provide((x) =>
    RollupLayer.pipe(
      Layer.provideMerge(
        BuilderConfig.Live({
          configFile: x.configFile,
          watch: x.watch,
        }),
      ),
      Layer.provide(TwinLogger.layer),
    ),
  ),
);

const run = twinCli.pipe(
  CliCommand.withSubcommands([twinBuild]),
  CliCommand.provide(() => TwinLogger.layer),
  CliCommand.run({
    name: 'Twin Cli',
    version: `v${pkg.version}`,
  }),
);

Effect.suspend(() => run(process.argv)).pipe(
  Effect.provide(NodeContext.layer),
  Logger.withMinimumLogLevel(LogLevel.All),
  NodeRuntime.runMain,
  // Effect.runFork,
  // Fiber.await,
  // Effect.map((x) => x),
  // Effect.runPromise,
);
