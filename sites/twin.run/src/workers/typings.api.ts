import * as EffectWorker from '@effect/platform/Worker';
import * as BrowserWorker from '@effect/platform-browser/BrowserWorker';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as Stream from 'effect/Stream';
// import * as monaco from 'monaco-editor';
import type { GetPackageTypings } from './shared.schemas';
import typingsWorker from './typings.worker?worker&url';

const typingsWorkerLayer = BrowserWorker.layer(
  () => new globalThis.Worker(typingsWorker, { type: 'module' }),
);

export const addPackageTypings = (packages: GetPackageTypings[]) =>
  Effect.gen(function* () {
    const pool = yield* EffectWorker.makePoolSerialized({
      size: 1,
    });

    return yield* pipe(
      packages,
      Stream.fromIterable,
      Stream.flatMap((x) => pool.execute(x)),
      Stream.map((response) => {
        return response.typings;
        // return response.typings.map((typing) => {
        //   return {
        //     disposable: typescriptDefaults.addExtraLib(typing.contents, typing.filePath),
        //     model:
        //       monaco.editor.getModel(Uri.parse(typing.filePath)) ||
        //       monaco.editor.createModel(typing.contents, 'typescript', Uri.parse(typing.filePath)),
        //   };
        // });
        // pipe(
        //   RA.map((typing) => ({
        //     disposable: typescriptDefaults.addExtraLib(typing.contents, typing.filePath),
        //     model: store.createFile(
        //       Uri.file(typing.filePath),
        //       new TextEncoder().encode(typing.contents),
        //     ),
        //   })),
        // );
      }),
      Stream.runCollect,
    );
  }).pipe(Effect.provide(typingsWorkerLayer));
