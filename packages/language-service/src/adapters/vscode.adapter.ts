import url from 'node:url';
import { asArray, identity } from '@native-twin/helpers';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as JSXParser from '../core/JSXParser.service';
import { LSPContext, type LSPTwinCompletionsResult } from '../core/LSPContext.service';
import { TwinParserContext } from '../core/TwinParser.service';
import { TypeScriptProgram } from '../core/TypescriptAPI.service';
import type { BaseTwinTextDocument } from '../documents/common/BaseTwinDocument';
import * as LSPTypes from '../internal/LSPAdapterSpec';
import type { VscodeCompletionItem } from '../models/completion.model';

export interface VscodeLSPAdapter
  extends LSPTypes.LSPAdapterSpec<never, LSPContext | TypeScriptProgram> {}

const getLSPDocument: VscodeLSPAdapter['getLSPDocument'] = Effect.fn(function* (filename) {
  const documentsService = yield* LSPContext;
  const document = yield* Effect.succeed(documentsService.getDocument(filename))
    .pipe(Effect.flatMap(identity))
    .pipe(Effect.mapError((e) => LSPTypes.FileNotFound.create(e)));

  return document;
});

const getProGramSourceFile = Effect.fn('ts: getSourceFile')(function* (filename: string) {
  const program = yield* TypeScriptProgram;
  const document = yield* getLSPDocument(filename);

  const filePath = url.fileURLToPath(filename);
  return yield* program.getSourceFile(filePath, document.getText());
});

const getRegions: VscodeLSPAdapter['getRegions'] = Effect.fn('vscodeAdapter: extractRegions')(
  function* (filename: string) {
    const parser = yield* JSXParser.JSXParser;
    const tsSource = yield* getProGramSourceFile(filename);
    const document = yield* getLSPDocument(filename);

    return parser.jsxNodesToRegions(parser.getJSXRootsFromSource(tsSource), document);
  },
);

const getRegionAt: VscodeLSPAdapter['getRegionAt'] = Effect.fn('vscodeAdapter: getTokenAtPosition')(
  function* (filename, position) {
    const document = yield* getLSPDocument(filename);
    const parser = yield* JSXParser.JSXParser;
    const regions = yield* getRegions(filename);

    return Option.fromNullable(parser.filterNodeAtPosition(regions, position, document));
  },
);

export const VscodeLSPAdapter = {
  getLSPDocument,
  getRegionAt,
  getRegions,
} satisfies VscodeLSPAdapter;

export const vscodeLSPAdapterExecutor = LSPTypes.createLSPAdapterExecutor(VscodeLSPAdapter);

export const twinCompletionsToVscode = <Document extends BaseTwinTextDocument>(
  region: LSPTwinCompletionsResult['region'],
  document: Document,
  offset: number,
) =>
  Effect.gen(function* () {
    const parser = yield* TwinParserContext;

    const regionsToVisit: LSPTypes.AnyTwinNodeRegion[] = Option.map(region, asArray).pipe(
      Option.getOrElse(() => []),
    );
    let valueRegion: LSPTypes.JsxAttributeValueRegion | null = null;
    while (regionsToVisit.length > 0) {
      const nextRegion = regionsToVisit.pop();
      if (!nextRegion) break;

      // if (offset <= nextRegion.range.start.character || offset >= nextRegion.range.end.character)
      //   continue;

      switch (nextRegion._tag) {
        case 'JsxAttributeRegion':
          regionsToVisit.push(nextRegion.attributeValue);
          continue;
        case 'JsxNodeRegion':
          regionsToVisit.push(...nextRegion.styledProps);
          continue;
        case 'JsxAttributeBindingRegion':
        case 'JsxTagName':
          continue;
        case 'JsxAttributeValueRegion':
          valueRegion = nextRegion;
          break;
      }
    }

    if (!valueRegion) return [];

    const parserResult = parser.runTwinParser(valueRegion.getText() ?? '', valueRegion.range.start);

    const locatedToken = parserResult.composedClasses.find(
      (x) => document.isPositionInRange(document.positionAt(offset), x.documentLoc.originalRange),
      // offset >= x.documentLoc.originalRange.start.character &&
      // offset <= x.documentLoc.originalRange.end.character,
    );
    if (!locatedToken) return [];

    const rules = yield* parser.findRulesByKey(locatedToken.classNameText);
    return rules.map((rule): VscodeCompletionItem => {
      return rule.toVscode(locatedToken.documentLoc.originalRange);
    });
  });
