import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import * as Completions from './utils/completions.maps';

export const getCompletionEntryDetails = (
  entry: vscode.CompletionItem,
  _cancelToken: vscode.CancellationToken,
): Effect.Effect<vscode.CompletionItem, never, NativeTwinManagerService> => {
  return Effect.gen(function* () {
    const twin = yield* NativeTwinManagerService;
    return yield* Effect.Do.pipe(
      () =>
        Effect.succeed({
          twinRules: twin.completions.twinRules,
          context: createStyledContext(twin.userConfig.root.rem),
        }),
      Effect.let('completionRules', ({ twinRules }) =>
        HashSet.filter(twinRules, (x) => x.completion.className === entry.label),
      ),
      Effect.let('completionEntries', ({ completionRules, context }) =>
        HashSet.map(completionRules, (x) => {
          const sheet = twin.tw(x.completion.className);
          const finalSheet = getSheetEntryStyles(sheet, context);

          return Completions.createCompletionEntryDetails(entry, finalSheet);
        }),
      ),
      Effect.map((x) =>
        x.completionEntries.pipe(
          ReadonlyArray.fromIterable,
          ReadonlyArray.head,
          Option.getOrElse(() => entry),
        ),
      ),
    );
  });
};
