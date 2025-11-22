// import * as vscode from 'vscode';
// import * as Cause from 'effect/Cause';
// import * as Effect from 'effect/Effect';
// import * as Layer from 'effect/Layer';
// import * as Stream from 'effect/Stream';
// import { VscodeContext } from '../extension/extension.service';
// import { extensionConfigValue, thenable } from '../extension/extension.utils';

// export const LanguageServiceLive_ = Effect.gen(function* () {
//   const parser = yield* TwinRuntimeContext;
//   yield* VscodeContext;
//   const twinConfigStream = yield* createTwinHandler((uri) =>
//     parser.bootTwinRuntime(uri.path).pipe(Effect.catchAll(() => Effect.succeed(''))),
//   );
//   yield* isMultiRootWorkspaces;

//   yield* twinConfigStream.pipe(Stream.runDrain, Effect.forkDaemon);
// }).pipe(
//   Effect.withLogSpan('LanguageServiceClient'),
//   Effect.onError((error) => Effect.logError('ERROR: ', Cause.prettyErrors(error))),
//   Layer.scopedDiscard,
// );

// export const isMultiRootWorkspaces = Effect.gen(function* () {
//   const workspaceFolders = vscode.workspace.workspaceFolders;
//   yield* Effect.void;

//   yield* Effect.log('WORKSPACE_FOLDERS: ', workspaceFolders);
// });

// const createTwinHandler = Effect.fn(function* (
//   onUpdate: (configPath: vscode.Uri) => Effect.Effect<void>,
// ) {
//   const userConfigPath = yield* extensionConfigValue(
//     'configPath',
//     '**/{tailwind,twin,nativeTwin,native-twin}.config.{ts,js,mjs,cjs}',
//   );

//   return userConfigPath.changes.pipe(
//     // Stream.filterMap(({ value }) => Option.liftPredicate(value, (x) => x !== null)),
//     Stream.map((x) => x.value),
//     Stream.mapEffect((value) =>
//       thenable(() => vscode.workspace.findFiles(value, '**/node_modules/**', 1)),
//     ),
//     Stream.filterEffect((value) => {
//       if (value.length === 0) {
//         return Effect.logWarning('Cant find a native-twin configuration file').pipe(
//           Effect.map(() => false),
//         );
//       }
//       return Effect.succeed(true);
//     }),
//     Stream.map((uris) => uris[0]),
//     Stream.tap(onUpdate),
//   );
// });
