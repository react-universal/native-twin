// import * as Context from 'effect/Context';
// import * as Effect from 'effect/Effect';
// import * as HashSet from 'effect/HashSet';
// import * as Layer from 'effect/Layer';
// import * as Option from 'effect/Option';
// import * as PubSub from 'effect/PubSub';
// import type * as Queue from 'effect/Queue';
// import * as Ref from 'effect/Ref';
// import type * as Scope from 'effect/Scope';
// import * as SubscriptionRef from 'effect/SubscriptionRef';
// import type * as t from 'vscode-languageserver-types';
// import type { DiagnosticReport } from '../models/Editor.models';
// import type { JSXNode } from '../models/LSP.models';
// import { annotatedLayer } from '../utils/effect.utils';

// const make = Effect.gen(function* () {
//   const files = yield* SubscriptionRef.make(HashSet.empty<VFSFileHandler>());
//   const activeFile = yield* SubscriptionRef.make(Option.none<VFSFileHandler>());
//   const fileID = yield* Ref.make(1);
//   return {
//     files,
//     activeFile,
//     fileID,
//   };
// });

// export interface LspVFSContext extends Effect.Effect.Success<typeof make> {}
// export const LspVFSContext = Context.GenericTag<LspVFSContext>('LspVFSContext');
// export const LspVFSContextLive = Layer.effect(LspVFSContext, make).pipe(annotatedLayer('LspVFS'));

// export const createTwinDocument = (
//   documentsHandler: Client,
//   uri: t.URI,
//   // refresh: (doc: TwinLSPDocument) => Effect.Effect<void>,
// ) =>
//   Effect.gen(function* () {
//     const { files, activeFile, fileID } = yield* LspVFSContext;
//     const diagnostics = yield* Effect.acquireRelease(
//       PubSub.sliding<DiagnosticReport>({ capacity: 10 }),
//       PubSub.shutdown,
//     );
//     const regions = yield* Effect.acquireRelease(
//       PubSub.sliding<JSXNode>({ capacity: 10 }),
//       PubSub.shutdown,
//     );
//     const id = yield* Ref.getAndUpdate(fileID, (_) => _ + 1);
//     const file: VFSFileHandler = {
//       id,
//       uri,
//       diagnostics: PubSub.subscribe(diagnostics),
//       regions: PubSub.subscribe(regions),
//     };

//     yield* Effect.acquireRelease(SubscriptionRef.update(files, HashSet.add(file)), (_, exit) =>
//       SubscriptionRef.update(files, HashSet.remove(file)).pipe(
//         Effect.tap(() => Effect.log('cleaning files for: ', file.uri, exit)),
//       ),
//     );

//     yield* Effect.acquireRelease(
//       SubscriptionRef.update(
//         activeFile,
//         Option.orElseSome(() => file),
//       ),
//       () =>
//         SubscriptionRef.update(
//           activeFile,
//           Option.filter((_) => _ !== file),
//         ).pipe(Effect.tap(() => Effect.log('Closing resource: ', uri))),
//     );

//     yield* documentsHandler.queue.take.pipe(
//       Effect.flatMap((res) => {
//         if (res._tag === 'Node') return regions.offer(res);
//         return diagnostics.offer(res);
//       }),
//       Effect.forever,
//       Effect.fork,
//     );
//   }).pipe(Effect.awaitAllChildren, Effect.scoped);

