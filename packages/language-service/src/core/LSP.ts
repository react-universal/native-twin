import { asArray } from '@native-twin/helpers';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import type * as Stream from 'effect/Stream';
import type * as server from 'vscode-languageserver';
import type { DocumentUri, TextDocument } from 'vscode-languageserver-textdocument';
import type { BaseTwinTextDocument } from '../documents/common/BaseTwinDocument';
import * as Spec from '../internal/LSPAdapterSpec';
import type { TwinLSPAdapterLayerIn } from '../internal/RunnerLayer';
import type { TwinRuleRegistry } from '../models/TwinParser.models';
import { TwinParserContext } from './TwinParser.service';

export interface LSPTwinCompletionsResult {
  twinTokens: TwinRuleRegistry[];
  region: Option.Option<Spec.AnyTwinNodeRegion>;
  prevRegion: Option.Option<Spec.AnyTwinNodeRegion>;
  nextRegion: Option.Option<Spec.AnyTwinNodeRegion>;
}

export interface TwinLSPCompletionDefinition {
  name: string;
  // adapter: Spec.LSPAdapterSpec<E, R>;
  apply: <E = never, R = never>(
    filename: string,
    position: Spec.LSPPosition,
    executor: Spec.LSPAdapterSpec<E, R>,
  ) => Effect.Effect<LSPTwinCompletionsResult, Spec.AnyLSPError | E, TwinLSPAdapterLayerIn | R>;
}

export function createTwinCompletions(
  definition: TwinLSPCompletionDefinition,
): TwinLSPCompletionDefinition {
  return definition;
}

/***** */

export interface LSPContext {
  connection: server.Connection;
  executor: Spec.LSPAdapterSpec;
  documents: server.TextDocuments<TextDocument>;
  getDocument: (uri: DocumentUri) => Option.Option<BaseTwinTextDocument>;
  getAllDocuments: () => Array<TextDocument>;
  documentChanges: Stream.Stream<TextDocument>;
}

export const LSPContext = Context.GenericTag<LSPContext>('lsp/MainContext');

export const twinCompletionsToVscode = <Document extends BaseTwinTextDocument>(
  region: LSPTwinCompletionsResult['region'],
  document: Document,
  offset: number,
) =>
  Effect.gen(function* () {
    const parser = yield* TwinParserContext;

    const regionsToVisit: Spec.AnyTwinNodeRegion[] = Option.map(region, asArray).pipe(
      Option.getOrElse(() => []),
    );
    let valueRegion: Spec.JsxAttributeValueRegion | null = null;
    while (regionsToVisit.length > 0) {
      const nextRegion = regionsToVisit.pop();
      if (!nextRegion) break;

      if (offset <= nextRegion.range.start.character || offset >= nextRegion.range.end.character)
        continue;
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

    const parserResult = parser.runTwinParser(
      valueRegion.getText() ?? '',
      valueRegion.range.start.character,
    );
    const locatedToken = parserResult.composedClasses.find(
      (x) => offset >= x.documentLoc.originalRange.pos && offset <= x.documentLoc.originalRange.end,
    );
    if (!locatedToken) return [];

    const rules = yield* parser.findRulesByKey(locatedToken.classNameText);
    return rules.map((rule) => {
      return rule.toVscode(
        document,
        Spec.range(
          Spec.position(locatedToken.documentLoc.originalRange.pos),
          Spec.position(locatedToken.documentLoc.originalRange.end),
        ),
      );
    });
  });
