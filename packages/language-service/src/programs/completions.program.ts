import * as Effect from 'effect/Effect';
import type t from 'vscode-languageserver';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { TwinCompletionItem } from '../models/Editor.models';
import { maybeParsedRuleAtPosition } from './common.program';

export const getCompletionsAtPosition = Effect.fn('classNameCompletions')(
  function* (filename: t.URI, position: t.Position) {
    const parser = yield* TwinParserContext;
    const executor = yield* LSPAdapterSpec;
    const document = yield* executor.getLSPDocument(filename);
    const result = yield* maybeParsedRuleAtPosition(document, position);

    return (yield* parser.findRulesByKey(result.locatedToken.parsed.n)).map((rule) =>
      new TwinCompletionItem(
        rule,
        result.locatedToken,
        result.cursorOffset,
        document,
      ).toCompletion(),
    );
  },
  (effect, filename, position) =>
    Effect.catchAll(effect, (error) =>
      Effect.zipRight(
        Effect.logDebug('Completion: Error in ', filename, position, error.message),
        Effect.succeed([]),
      ),
    ),
);
