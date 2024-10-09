import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import pkg from '../package.json';
import * as CliConfigs from './config/cli.config';
import { RollupBuild } from './rollup/twin.rollup';
import { TypescriptService } from './ts/twin.types';
import { TSUpBuild } from './tsup/twin.tsup';
import * as CliCommand from '@effect/cli/Command';
import * as NodeCommandExecutor from '@effect/platform-node/NodeCommandExecutor';
import * as NodeContext from '@effect/platform-node/NodeContext';
import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import * as NodeRuntime from '@effect/platform-node/NodeRuntime';

const MainNodeContext = NodeCommandExecutor.layer.pipe(
  Layer.provideMerge(NodeFileSystem.layer),
  Layer.merge(NodePath.layer),
  Layer.merge(NodeContext.layer),
);

const TwinContext = TypescriptService.Live.pipe(
  Layer.provideMerge(TSUpBuild.Live),
  Layer.provideMerge(RollupBuild.Live),
);

const MainLive = TwinContext.pipe(Layer.provideMerge(MainNodeContext));

const twinCli = CliCommand.make('twin-cli', CliConfigs.CommandConfig).pipe(
  CliCommand.withDescription('Twin Cli'),
);

const twinBuild = CliCommand.make('build', CliConfigs.BuildConfig, (buildConfig) =>
  Effect.gen(function* () {
    const mainCli = yield* twinCli;
    const bundler = yield* RollupBuild;
    const mainConfig = yield* CliConfigs.loadConfigFile(process.cwd());
    const shouldWatch = buildConfig.watch || mainCli.watch;

    const buildStream = yield* pipe(
      Effect.if(Effect.succeed(shouldWatch), {
        onTrue: () => bundler.watch(mainConfig, shouldWatch),
        onFalse: () => bundler.build(mainConfig, shouldWatch),
      }),
    );

    const buildRunner = pipe(
      buildStream,
      Stream.mapEffect((x) => Effect.log(x)),
      Stream.runDrain,
    );

    if (!shouldWatch) {
      yield* bundler.addFinalizer;
      yield* buildRunner;
      yield* Effect.interrupt;
    } else {
      const latch = yield* pipe(buildRunner, Effect.fork);
      yield* pipe(latch, Fiber.await);
    }
  }),
);

const run = twinCli.pipe(
  CliCommand.withSubcommands([twinBuild]),
  CliCommand.run({
    name: 'Twin Cli',
    version: `v${pkg.version}`,
  }),
);

Effect.suspend(() => run(process.argv)).pipe(
  Effect.provide(MainLive),
  Effect.tapErrorCause(Effect.logError),
  Effect.scoped,
  NodeRuntime.runMain,
  // Effect.runFork,
  // Fiber.await,
  // Effect.map((x) => x),
  // Effect.runPromise,
);
