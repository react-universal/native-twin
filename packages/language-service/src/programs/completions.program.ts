import * as Effect from 'effect/Effect';
import * as LSP from '../core/LSPContext.service';
import { TwinParserContext } from '../core/TwinParser.service';
import { LSPAdapterSpec } from '../internal/LSPAdapterSpec';
import { TwinCompletionItem } from '../models/Completion.model';
import { maybeParsedRuleAtPosition } from './common.program';

export const getCompletionsAtPosition = LSP.createTwinCompletions({
  name: 'classNameCompletions',
  apply: Effect.fn('classNameCompletions')(
    function* (filename, position) {
      const parser = yield* TwinParserContext;
      const executor = yield* LSPAdapterSpec;
      const document = yield* executor.getLSPDocument(filename);
      const result = yield* maybeParsedRuleAtPosition(document, position);

      const twinTokens = yield* parser.findRulesByKey(result.locatedToken.parsed.n);
      return twinTokens.map((rule) =>
        new TwinCompletionItem(
          rule,
          result.locatedToken,
          result.cursorOffset,
          document,
        ).toCompletion(),
      );
    },
    (effect, filename, position) => {
      return effect.pipe(
        Effect.catchAll((error) =>
          Effect.log('Completion: Error in ', filename, position, error.message).pipe(
            Effect.andThen(() => Effect.succeed([])),
          ),
        ),
      );
    },
  ),
});
