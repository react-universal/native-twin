// import * as FS from '@effect/platform/FileSystem';
// import { Array, Deferred, Effect, pipe, PubSub, Queue } from 'effect';

// const fileWatcherPBS = PubSub.unbounded().pipe(
//   Effect.andThen((pubsub) =>
//     Effect.scoped(
//       Effect.gen(function* () {
//         const fileWatcherSubscriber = yield* pipe(
//           pubsub.pipe(
//             PubSub.subscribe,
//             Effect.flatMap((subscription) => {
//               return pipe(
//                 Deferred.succeed(
//                   Deferred.sync(() => true),
//                   false,
//                 ),

//                 (x) => Effect.zipRight(x),
//                 // Deferred.await,
//                 Effect.zipRight(
//                   pipe(
//                     Array.range(0, 1),
//                     Effect.forEach(() => Queue.take(subscription)),
//                   ),
//                 ),
//               );
//             }),
//           ),
//         );

//         return { dequeue, pubsub };
//       }),
//     ),
//   ),
// );

// /** @category Queue helpers */
// const sendFilePath = (
//   offerOnlyQueue: Queue.Enqueue<FS.WatchEvent>,
//   path: FS.WatchEvent,
// ) => Queue.offer(offerOnlyQueue, path);
// /** @category Queue helpers */
// const receiveFilePath = (takeOnlyQueue: Queue.Dequeue<FS.WatchEvent>) =>
//   Queue.take(takeOnlyQueue);