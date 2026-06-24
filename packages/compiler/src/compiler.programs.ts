// import * as Effect from 'effect/Effect';
// import * as Stream from 'effect/Stream';
// import type { TwinModuleAst } from './Babel';
// import { TwinNodeContext, type TwinRunnerPlatform } from './Config';

// export const compileAst = Effect.fn(function* (
//   twinAst: TwinModuleAst,
//   platform: TwinRunnerPlatform,
// ) {
//   const ctx = TwinNodeContext.Service;
//   const extractor = yield* ctx.state.twRunners.get.pipe(
//     Effect.map(({ native, web }) => (platform === 'web' ? web : native)),
//   );
//   const moduleTrees = yield* Stream.fromIterable(twinAst.jsxElements).pipe(
//     Stream.mapEffect((element) => transformJSXElement(element, extractor)),
//     Stream.flatMap((tree) => Stream.fromIterable(tree.all())),
//     Stream.runCollect,
//     Effect.map(RA.fromIterable),
//   );

//   return moduleTrees;
// });
