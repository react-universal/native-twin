import * as vscode from 'vscode';
import type { InternalTwinConfig } from '@native-twin/language-service';
import { SubscriptionRef } from 'effect';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';
import { extensionConfigValue, thenable } from '../extension/extension.utils';
import { requireJS } from '../utils/load-js';

export const LanguageServiceLive_ = Effect.gen(function* () {
  const twinConfig = yield* createTwinHandler();

  yield* twinConfig.changes.pipe(
    Stream.tap((_) => Effect.log(_)),
    // Stream.forever,
    Stream.runDrain,
    Effect.forkDaemon,
  );
}).pipe(
  Effect.withLogSpan('LanguageServiceClient'),
  Effect.onError((error) => Effect.logError('ERROR: ', Cause.prettyErrors(error))),
  Layer.scopedDiscard,
);

// const acquireTwinFileWatcher = Effect.acquireRelease(
//   Effect.sync(() => vscode.workspace.createFileSystemWatcher('**/tailwind.config.*', false, false)),
//   (watcher) => Effect.sync(() => watcher.dispose()),
// );

export const createTwinHandler = Effect.fn(function* () {
  const twinConfig = yield* SubscriptionRef.make<Option.Option<InternalTwinConfig>>(Option.none());

  const userConfigPath = yield* extensionConfigValue(
    'configPath',
    '**/{tailwind,twin,nativeTwin,native-twin}.config.{ts,js,mjs,cjs}',
  );

  yield* userConfigPath.changes.pipe(
    // Stream.filterMap(({ value }) => Option.liftPredicate(value, (x) => x !== null)),
    Stream.map((x) => x.value),
    Stream.mapEffect((value) =>
      thenable(() => vscode.workspace.findFiles(value, '**/node_modules/**', 1)),
    ),
    Stream.filterEffect((value) => {
      if (value.length === 0) {
        return Effect.logWarning('Cant find a native-twin configuration file').pipe(
          Effect.map(() => false),
        );
      }
      return Effect.succeed(true);
    }),
    Stream.map((uris) => uris[0]),
    Stream.map((uri) => Option.getOrElse(requireJS(uri.path), () => null)),
    Stream.filterMap((value) => Option.liftPredicate(value, (x) => x !== null)),
    Stream.tap((x) => SubscriptionRef.set(twinConfig, Option.some(x))),
    // Stream.forever,
    Stream.runDrain,
    Effect.forkDaemon,
  );

  return twinConfig;
});
