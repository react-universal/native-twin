import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import * as Console from 'effect/Console';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { makeBuilderConfig } from '../config/cli.config';
import { CliBuildConfigInput } from '../config/config.types';

const FSContext = Layer.merge(NodePath.layer, NodeFileSystem.layer);

export class BuilderConfig extends Effect.Tag('common/builder/config')<
  BuilderConfig,
  {
    platform: 'browser' | 'node';
    reactNative: boolean;
    minify: boolean;
    logs: boolean;
    types: boolean;
    vscode: boolean;
    external: string[];
    entries: string[];
    watch: boolean;
    // configFile: string;
  }
>() {
  static Live = (params: CliBuildConfigInput) =>
    Layer.scoped(
      BuilderConfig,
      makeBuilderConfig(params).pipe(Effect.provide(FSContext)),
    );
}

export class BuilderService extends Context.Tag('common/builder/executor')<
  BuilderService,
  {
    build: Effect.Effect<Stream.Stream<string>, never, BuilderConfig>;
    watch: Effect.Effect<Stream.Stream<string>, never, BuilderConfig>;
  }
>() {}

export type BuilderServiceShape = BuilderService['Type'];

export const provideBuilderRunner = (
  runner: Effect.Effect<BuilderService['Type'], never>,
) => {
  return Layer.scoped(BuilderService, runner);
};

export const builderRunner = Effect.gen(function* () {
  const config = yield* BuilderConfig;
  const bundler = yield* BuilderService;

  const runner = yield* config.watch ? bundler.watch : bundler.build;

  const buildRunner = runner.pipe(Stream.runForEach((x) => Console.log(x, '\n')));

  if (config.watch) {
    const latch = yield* pipe(buildRunner, Effect.fork);
    yield* pipe(latch, Fiber.await);
    return;
  }
  yield* buildRunner;
});
