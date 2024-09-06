import { Worker } from '@effect/platform';
import { NodeWorker } from '@effect/platform-node';
import { layerSpawner, Spawner } from '@effect/platform/Worker';
import * as Console from 'effect/Console';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as WT from 'node:worker_threads';

interface MyWorkerPool {
  readonly _: unique symbol;
}
export const TwinWorkerPool = Context.GenericTag<
  MyWorkerPool,
  Worker.WorkerPool<number, never, number>
>('@app/MyWorkerPool');

const TwinWorkerPoolLiveNode = Worker.makePlatform();
const TwinWorkerPoolLive = Worker.makePoolLayer(TwinWorkerPool, { size: 3 }).pipe(
  Layer.provideMerge(layerSpawner(Spawner.Service)),
  Layer.provide(NodeWorker.layer(() => new WT.Worker('./worker/range.ts'))),
);

export const twinCliWorkerRun = Effect.gen(function* () {
  const worker = TwinWorkerPoolLiveNode({
    listen(options) {
      return Console.log('Listening', options);
    },
    setup(options) {
      return Effect.succeed({
        postMessage(message, transfers) {
          console.log('Message: ', message, transfers, options);
        },
      });
    },
  });
  const spawn = yield* worker.spawn(11);
  yield* spawn.run((wr) =>
    Effect.succeed(1).pipe(Effect.tap(Console.log('PAYLOAD: ', wr))),
  );
  yield* spawn.send('asdasd', []);
  return worker;
}).pipe(Effect.provide(TwinWorkerPoolLive));
