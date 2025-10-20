// import * as RA from 'effect/Array';
// import * as Effect from 'effect/Effect';
// import * as Ref from 'effect/Ref';
// import * as Stream from 'effect/Stream';
// import type { TwinJsxStyleSheet } from '../Domain/TwinJsxSheet';
// import { TwinFSContext } from '../FileSystem';

// export const createStyledObjectProgram = Effect.fn(function* (
//   sheets: TwinJsxStyleSheet[],
//   path: string,
// ) {
//   const fs = yield* TwinFSContext;
//   const filePath = yield* fs.makeTempFile(path, 'native');

//   const file = yield* fs.openFile(path, { flag: 'w+' });
//   yield* Stream.fromIterable(sheets).pipe(
//     Stream.flatMap((x) => Stream.fromIterable(x.nodes)),
//     Stream.flatMap((x) => Stream.fromIterable(x.styledProps)),
//     Stream.map((styledProp) => {
//       return {};
//     }),
//     Stream.runDrain,
//   );
// });
