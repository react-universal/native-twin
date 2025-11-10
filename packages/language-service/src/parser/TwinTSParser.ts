// import { Context, Effect, Layer } from 'effect';
// import { TypescriptApi, TypescriptUtils } from '../typescript';
// import { TwinParser, TwinParserAdapter, TwinParserContext } from './TwinParser.service';
// import ts from 'ts-morph';

// interface TwinTSParser
//   extends TwinParserAdapter<
//     ts.SourceFile,
//     ts.BindingName,
//     ts.JsxElement | ts.JsxSelfClosingElement,
//     ts.JsxAttribute
//   > {}

// const createTwinParser = Effect.gen(function* () {
//   const tsUtils = yield* TypescriptUtils;
//   const tsAPI = yield* TypescriptApi;

//   const service: TwinTSParser = {
//     parseFile: (filePath: string, text: string) => Effect.gen(function* () {
//       const sourceFile = tsAPI.createSourceFile(filePath, text);
//       const jsxDeclarators = sourceFile
//         .getStatements()
//         .map(tsUtils.getJSXElementStatement)
//         .filter((_) => _ !== null)
//         .map((_): ReturnType<TwinTSParser['parseFile']>['jsxDeclarators'][number] => {
//           const rootNode = tsUtils.getTwinJSXNode()
//           return {
//             ast: _.declarator,
//             name: _.declarator.getText(),
//             rootNode: {ast: }
//           }
//         });

//       return { jsxDeclarators, ast: sourceFile };
//     }),
//   };
// });
