import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import { TwinParserContext } from '../core/TwinParser.service';
import type { LSPTextDocument } from '../internal/LSPAdapterSpec';
import type { Position } from '../models/LSP.models';

export const maybeParsedRuleAtPosition = Effect.fn(function* (
  document: LSPTextDocument,
  position: Position,
) {
  const parser = yield* TwinParserContext;
  const cursorOffset = document.offsetAt(position);

  const parsableRegion = Option.fromNullable(document.findRegionAt(position));

  const parserResult = Option.map(parsableRegion, (region) =>
    parser.runTwinParser({
      text: region.value.text,
      startOffset: region.value.startOffset,
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
    valueRegion: parsableRegion,
    location,
    cursorOffset: Option.some(cursorOffset),
  });
});
