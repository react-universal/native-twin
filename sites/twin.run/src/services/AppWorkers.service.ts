import * as EffectWorker from '@effect/platform/Worker';
import * as BrowserWorker from '@effect/platform-browser/BrowserWorker';
import * as Console from 'effect/Console';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Stream from 'effect/Stream';
import { traceLayerLogs } from '../utils/logger.utils';
import compilerWorker from '../workers/compiler.worker?worker&url';
import type { CompileCodeRequestSchema, GetPackageTypings } from '../workers/shared.schemas';
import typingsWorker from '../workers/typings.worker?worker&url';

const typingsInstallerWorkerLayer = BrowserWorker.layer(
  () => new globalThis.Worker(typingsWorker, { type: 'module' }),
);
const compilerWorkerLayer = BrowserWorker.layer(
  () => new globalThis.Worker(compilerWorker, { type: 'module', name: 'compiler.worker' }),
);

const make = Effect.gen(function* () {
  return {
    installDefinitions,
    compileCode,
  };

  function compileCode(code: CompileCodeRequestSchema) {
    return Effect.gen(function* () {
      const pool = yield* EffectWorker.makePoolSerialized({
        size: 2,
        concurrency: 2,
      });
      return yield* pool.execute(code).pipe(
        Stream.tap((result) => Console.log('RESULT: ', result)),
        Stream.runCollect,
      );
    }).pipe(Effect.scoped, Effect.provide(compilerWorkerLayer));
  }

  function installDefinitions(packages: GetPackageTypings[]) {
    return Effect.gen(function* () {
      const pool = yield* EffectWorker.makePoolSerialized({
        size: 1,
        concurrency: 2,
      });
      return yield* Stream.fromIterable(packages).pipe(
        Stream.flatMap((x) => pool.execute(x)),
        Stream.filter((x) => x.typings.length > 1),
        Stream.runCollect,
        Effect.map((_libraries) => {
          // setTypescriptDefaults();
          return _libraries;
        }),
      );
    }).pipe(Effect.scoped, Effect.provide(typingsInstallerWorkerLayer));
  }
});

export interface AppWorkers extends Effect.Effect.Success<typeof make> {}
export const AppWorkers = Context.GenericTag<AppWorkers>('app/workers');
export const AppWorkersLive = Layer.scoped(AppWorkers, make).pipe(traceLayerLogs('workers_svc'));
