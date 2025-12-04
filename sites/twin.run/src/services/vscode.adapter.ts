import url from 'node:url';
import { identity } from '@native-twin/helpers';
import {
  FileNotFound,
  JSXParser,
  LSPAdapterSpec,
  LSPContext,
  type LSPPosition,
  TwinLSPDocument,
  TypeScriptProgram,
} from '@native-twin/language-service/browser';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';

export const VscodeLSPAdapterLive = Effect.gen(function* () {
  const { getDocument } = yield* LSPContext;
  const program = yield* TypeScriptProgram;
  const parser = yield* JSXParser;

  const getLSPDocument = Effect.fn(function* (filename: string) {
    const document = yield* Effect.succeed(getDocument(filename))
      .pipe(Effect.flatMap(identity))
      .pipe(Effect.mapError((e) => FileNotFound.create(e)));

    const filePath = url.fileURLToPath(filename);
    const tsSource = yield* program.getSourceFile(filePath, document.getText());
    const regions = parser.jsxNodesToRegions(parser.getJSXRootsFromSource(tsSource), document);

    return new TwinLSPDocument(document, regions);
  });

  const getRegions = Effect.fn('vscodeAdapter: extractRegions')(function* (filename: string) {
    const document = yield* getLSPDocument(filename);
    return document.regions;
  });

  const getRegionAt = Effect.fn('vscodeAdapter: getTokenAtPosition')(function* (
    filename: string,
    position: LSPPosition,
  ) {
    const document = yield* getLSPDocument(filename);

    return document.findRegionAt(position);
  });

  return LSPAdapterSpec.of({
    getLSPDocument,
    getRegions,
    getRegionAt,
  });
}).pipe(Layer.effect(LSPAdapterSpec));

// export const twinCompletionsToVscode = <Document extends TwinLSPDocument>(
//   region: LSPTwinCompletionsResult['region'],
//   document: Document,
//   offset: number,
// ) =>
//   Effect.gen(function* () {
//     const parser = yield* TwinParserContext;

//     const regionsToVisit: LSPTypes.AnyTwinNodeRegion[] = asArray(region);
//     let valueRegion: LSPTypes.JsxAttributeValueRegion | null = null;
//     while (regionsToVisit.length > 0) {
//       const nextRegion = regionsToVisit.pop();
//       if (!nextRegion) break;

//       switch (nextRegion._tag) {
//         case 'JsxAttributeRegion':
//           regionsToVisit.push(nextRegion.attributeValue);
//           continue;
//         case 'JsxNodeRegion':
//           regionsToVisit.push(...nextRegion.styledProps);
//           continue;
//         case 'JsxAttributeBindingRegion':
//         case 'JsxTagName':
//           continue;
//         case 'JsxAttributeValueRegion':
//           valueRegion = nextRegion;
//           break;
//       }
//     }

//     if (!valueRegion) return [];

//     const parserResult = parser.runTwinParser({
//       text: valueRegion.text,
//       startOffset: document.offsetAt(valueRegion.range.start),
//     });

//     const locatedToken = parserResult.composedClasses.find((x) =>
//       document.isPositionInRange(
//         document.positionAt(offset),
//         document.getRangeFor(x.startOffset + x.parentStarts, x.endOffset + x.parentStarts),
//       ),
//     );
//     if (!locatedToken) return [];

//     const rules = yield* parser.findRulesByKey(locatedToken.classNameText);
//     return rules.map((rule): VscodeCompletionItem => {
//       return rule.toVscode(
//         document.getRangeFor(
//           locatedToken.startOffset + locatedToken.parentStarts,
//           locatedToken.endOffset + locatedToken.parentStarts,
//         ),
//         locatedToken.text,
//       );
//     });
//   });
