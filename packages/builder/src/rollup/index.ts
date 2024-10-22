import * as NodeFileSystem from '@effect/platform-node/NodeFileSystem';
import * as NodePath from '@effect/platform-node/NodePath';
import * as Console from 'effect/Console';
import * as Effect from 'effect/Effect';
import * as Fiber from 'effect/Fiber';
import { pipe } from 'effect/Function';
import * as Layer from 'effect/Layer';
import * as Queue from 'effect/Queue';
import { BuilderConfig } from '../config/config.context';
import { RollupBuild } from './twin.rollup';

const MainNodeContext = Layer.merge(NodePath.layer, NodeFileSystem.layer);
export const RollupLayer = RollupBuild.Live.pipe(Layer.provideMerge(MainNodeContext));

export const rollupBuild = Effect.gen(function* () {
  const config = yield* BuilderConfig;
  const bundler = yield* RollupBuild;

  if (config.watch) {
    const buildRunner = Queue.take(bundler.results).pipe(
      Effect.map((x) => Console.log(x, '\n')),
      Effect.flatten,
      Effect.forever,
    );
    const latch = yield* pipe(buildRunner, Effect.fork);
    yield* pipe(latch, Fiber.await);
  }
});
