import * as Effect from 'effect/Effect';
import type ts from 'typescript';
import type { TwinPluginLayerReq } from '../RunnerLayer';

export interface CompletionEntryDefinition extends ts.CompletionEntry {
  // name: string;
  // kind: ts.ScriptElementKind;
  // insertText: string;
  // isSnippet: true;
  // replacementSpan?: ts.TextSpan;
}

// type TwinCompletionFn = (sourceFile: TwinSourceFile, position: number) => TwinCompletionFn;

export interface TwinCompletion {
  name: string;
  apply: (
    sourceFile: ts.SourceFile,
    position: number,
    options: ts.GetCompletionsAtPositionOptions | undefined,
    formatCodeSettings: ts.FormatCodeSettings | undefined,
  ) => Effect.Effect<Array<CompletionEntryDefinition>, never, TwinPluginLayerReq>;
}
export function createTwinCompletions(definition: TwinCompletion): TwinCompletion {
  const apply: TwinCompletion['apply'] = Effect.fn(`completions:${definition.name}`)(
    function* (sourceFile, position, options, formatCodeSettings) {
      if (options?.disableSuggestions) {
        yield* Effect.log('Suggestions disabled');
        return [];
      }

      return yield* definition
        .apply(sourceFile, position, options, formatCodeSettings)
        .pipe(Effect.withSpan('Completions', { attributes: { name: definition.name } }));
    },
  );

  return { name: definition.name, apply };
}
