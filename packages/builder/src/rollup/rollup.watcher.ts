import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import { pipe } from 'effect/Function';
import * as Queue from 'effect/Queue';
import * as Stream from 'effect/Stream';
import * as rollup from 'rollup';
import { inspect } from 'util';
import {
  getBundleModules,
  serializeBuildResult,
  serializeOutputChunks,
} from './plugins/analyzer.plugin';
import { createRollupConfig, rollupDefaultConfigs } from './rollup.config';

export const createRollupWatcher = (queue: Queue.Queue<string>) =>
  Effect.gen(function* () {
    const offerResult = (message: string) => {
      Queue.unsafeOffer(queue, message);
    };

    const plugin: rollup.Plugin = {
      name: 'twin-builder',
      watchChange(id, change) {
        if (change.event === 'create') {
          return offerResult(`watchChange[twin-builder] Create new watcher... ${id}`);
        }
        if (change.event === 'delete') {
          return offerResult(`watchChange[twin-builder] Delete watcher... ${id}`);
        }
        if (change.event === 'update') {
          return offerResult(`watchChange[twin-builder] Update watcher... ${id}`);
        }
        return;
      },
      writeBundle(_, bundle) {
        pipe(
          getBundleModules(bundle),
          serializeOutputChunks,
          serializeBuildResult,
          (data) => Queue.unsafeOffer(queue, data),
        );
      },
      closeWatcher() {
        return offerResult(`[twin-builder] Closing watcher...`);
      },
    };
    const rollupConfigs = yield* Effect.sync(() =>
      createRollupConfig(rollupDefaultConfigs, [plugin]),
    );

    const watcher = yield* Effect.sync(() => rollup.watch(rollupConfigs));
    return yield* Stream.async<string>((emit) => {
      watcher
        .on('change', async (event) => {
          return emit.single(`[twin-builder] Detected change in: ${event}`);
        })
        .on('restart', async () => {
          return emit.single(`[twin-builder] Build restarted...`);
        })
        .on('event', async (event) => {
          switch (event.code) {
            case 'END':
            case 'START':
              return;
            case 'BUNDLE_START':
              return emit.single(`BUNDLE_START: ${event.output}`);
            case 'BUNDLE_END':
              return event.result.close();
            case 'ERROR':
              return emit.single(
                `[twin-builder] Build error \n ${inspect(event.error, false, null, true)}.`,
              );
          }
        })
        .on('close', async () => {
          return emit.done(Exit.succeed(`[twin-builder] Build closed.`));
        });
      return Effect.void;
    }).pipe(
      Stream.runForEach((message) => queue.offer(message)),
      Effect.fork,
    );
  });
