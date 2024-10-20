import { Chunk } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Queue from 'effect/Queue';
import { BuilderConfig } from '../config/config.context';
import { createRollupBuilder } from './rollup.builder';
// import * as Record from 'effect/Record';
import { createRollupWatcher } from './rollup.watcher';

const make = Effect.gen(function* () {
  const results = yield* Queue.unbounded<string>();
  const cliConfig = yield* BuilderConfig;

  if (cliConfig.watch) {
    yield* createRollupWatcher(results);
  } else {
    const runner = yield* createRollupBuilder(results);
    yield* Effect.log(Chunk.join(runner, '\n'));
  }

  return {
    results,
  } as const;
});

export class RollupBuild extends Context.Tag('rollup/context')<
  RollupBuild,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.scoped(this, make);
}
