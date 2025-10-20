// import * as RA from 'effect/Array';
// import * as Effect from 'effect/Effect';
// import * as Ref from 'effect/Ref';
// import * as Stream from 'effect/Stream';
// import { TwinStyledProp } from '../Domain/JSXStyledProp';
// import type { TwinModuleAst } from '../Domain/TwinAst';
// import type { TwinJSXElement } from '../Domain/TwinJSXElement';
// import { TwinJsxNodeSheet, TwinJsxStyleSheet } from '../Domain/TwinJsxSheet';
// import type { TwinTransformOptions } from '../Project/Model';
// import { TwinStyleSheetContext } from '../StyleSheet';

// export const transformModule = (twinAst: TwinModuleAst, { platform }: TwinTransformOptions) =>
//   Effect.gen(function* () {
//     const { extractor } = yield* TwinStyleSheetContext;
//     const twin = yield* extractor.getExtractor(platform);
//     const sheetRef = yield* Ref.make(new Map<string, TwinJsxStyleSheet>());

//     yield* Stream.fromIterable(twinAst.jsxElements).pipe(
//       Stream.mapEffect((jsxElement) => transformJSXElement(jsxElement)),
//       Stream.tap((sheet) => Ref.update(sheetRef, (x) => x.set(sheet.id, sheet))),
//       Stream.runDrain,
//     );

//     return yield* Ref.get(sheetRef);

//     function transformJSXElement(jsxElement: TwinJSXElement) {
//       return Stream.fromIterable(jsxElement.allNodes).pipe(
//         Stream.map((treeNode) => {
//           const styledProps = treeNode.value.classNameProps.map(
//             (x) => new TwinStyledProp(x, twin.twinFn(x.text)),
//           );
//           return new TwinJsxNodeSheet(treeNode, styledProps);
//         }),
//         Stream.runCollect,
//         Effect.map((nodes) => new TwinJsxStyleSheet(jsxElement, RA.fromIterable(nodes))),
//       );
//     }
//   });
