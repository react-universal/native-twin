import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as LSP from '../core/LSPContext.service';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { getCompletionItem } from '../models/Completion.model';
import type {
  ParsedRuleWithLocation,
  TwinParserOutput,
  TwinRuleRegistry,
} from '../models/TwinParser.models';

export const getCompletionsAtPosition = LSP.createTwinCompletions({
  name: 'classNameCompletions',
  apply: Effect.fn('classNameCompletions')(function* (filename, position) {
    const parser = yield* TwinParserContext;
    const executor = yield* LSPAdapterSpec;
    const region = yield* executor.getRegionAt(filename, position);
    const document = yield* executor.getLSPDocument(filename);
    const cursorOffset = document.offsetAt(position);
    const twinTokens: TwinRuleRegistry[] = [];

    const valueRegion = document.findRegionAt(position);
    const text = valueRegion?.text;
    let parserResult: TwinParserOutput | null = null;
    let locatedToken: ParsedRuleWithLocation | null | undefined = null;
    if (!!valueRegion && !!text) {
      parserResult = parser.runTwinParser({
        startOffset: document.offsetAt(valueRegion.range.start),
        text,
      });

      locatedToken = parserResult.result.find(
        (token) => cursorOffset >= token.startOffset && cursorOffset <= token.endOffset,
      );

      if (locatedToken) {
        const rules = yield* parser.findRulesByKey(locatedToken.parsed.n);
        twinTokens.push(...rules);
      }
    }

    return {
      composedClass: Option.fromNullable(locatedToken),
      parserResult: Option.fromNullable(parserResult),
      region: region,
      completions: locatedToken
        ? twinTokens.map((rule) => getCompletionItem(rule, locatedToken, cursorOffset, document))
        : [],
      twinTokens,
    } satisfies LSP.LSPTwinCompletionsResult;
  }),
});
