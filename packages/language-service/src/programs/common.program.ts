import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { TwinParserContext } from '../core/TwinParser.service';
import type { LSPTextDocument } from '../internal/LSPAdapterSpec';
import type { LSPPosition } from '../models/LSP.models';

export const maybeParsedRuleAtPosition = Effect.fn(function* (
  document: LSPTextDocument,
  position: LSPPosition,
) {
  const parser = yield* TwinParserContext;
  const cursorOffset = document.offsetAt(position);

  const valueRegion = Option.fromNullable(document.findRegionAt(position));

  const parserResult = Option.map(valueRegion, (value) =>
    parser.runTwinParser({
      text: value.text,
      startOffset: document.offsetAt(value.range.start),
    }),
  );
  const locatedToken = Option.flatMap(parserResult, ({ result }) =>
    Option.fromNullable(
      result.find((token) => cursorOffset >= token.startOffset && cursorOffset <= token.endOffset),
    ),
  );

  const location = Option.map(locatedToken, (x) =>
    document.locationAtOffsets(x.startOffset, x.endOffset),
  );

  return yield* Option.all({
    locatedToken,
    parserResult,
    valueRegion,
    location,
    cursorOffset: Option.some(cursorOffset),
  });
});
