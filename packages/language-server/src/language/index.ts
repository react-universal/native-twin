import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import { LanguageDiagnostics } from './diagnostics.service';
import { LanguageDocumentation } from './language-documentation.service';
import { LanguageCompletions } from './language.service';

export const createLanguageService = Effect.scoped(
  Effect.gen(function* () {
    const completions = yield* LanguageCompletions;
    const diagnostics = yield* LanguageDiagnostics;
    const documentation = yield* LanguageDocumentation;
    return {
      completions,
      diagnostics,
      documentation,
    };
  }),
);

export const LanguageServiceLive = Layer.mergeAll(
  LanguageCompletions.Live,
  LanguageDocumentation.Live,
  LanguageDiagnostics.Live,
);
