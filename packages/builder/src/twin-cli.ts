import * as CliCommand from '@effect/cli/Command';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';
import * as Effect from 'effect/Effect';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import pkg from '../package.json';
import * as CliConfigs from './config/cli.config';
import { makeRollupLayer } from './rollup';
import { builderRunner } from './services/Builder.service';
import { TwinLogger } from './utils/logger';

const twinCli = CliCommand.make('twin-cli', CliConfigs.CommandConfig).pipe(
  CliCommand.withDescription('Twin Cli'),
);

const twinBuild = CliCommand.make('build', CliConfigs.CliBuildOptions).pipe(
  CliCommand.withHandler(() => builderRunner),
  CliCommand.provide((x) => makeRollupLayer(x)),
);

const run = twinCli.pipe(
  CliCommand.withSubcommands([twinBuild]),
  CliCommand.provide(() => TwinLogger),
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
