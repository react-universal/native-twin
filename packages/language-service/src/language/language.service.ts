import { sheetEntriesToCss } from '@native-twin/css';
import * as ReadonlyArray from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type * as vscode from 'vscode-languageserver';
import { Range } from 'vscode-languageserver-types';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.service';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import { VscodeCompletionItem } from './models/completion.model';
import { getCompletionsForTokens } from './utils/completion.pipes';
import * as Completions from './utils/completions.maps';

export class LanguageCompletions extends Context.Tag('lsp/completions')<
  LanguageCompletions,
  {
    readonly getCompletionsAtPosition: (
      params: vscode.CompletionParams,
      _cancelToken: vscode.CancellationToken,
      _progress: vscode.WorkDoneProgressReporter,
      _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
    ) => Effect.Effect<VscodeCompletionItem[]>;
    readonly getCompletionEntryDetails: (
      entry: vscode.CompletionItem,
      _cancelToken: vscode.CancellationToken,
    ) => Effect.Effect<vscode.CompletionItem>;
  }
>() {
  static Live = Layer.scoped(
    LanguageCompletions,
    Effect.gen(function* () {
      const twinService = yield* NativeTwinManagerService;
      const documentsHandler = yield* DocumentsService;
      return {
        getCompletionsAtPosition(params) {
          return Effect.gen(function* () {
            const extracted = Option.Do.pipe(
              Option.bind('document', () =>
                documentsHandler.getDocument(params.textDocument),
              ),
              Option.let('cursorOffset', ({ document }) =>
                document.positionToOffset(params.position),
              ),
              Option.bind('languageRegionAtPosition', ({ document }) =>
                document.getTemplateAtPosition(params.position),
              ),
              Option.let(
                'parsedText',
                ({ languageRegionAtPosition }) => languageRegionAtPosition.regionNodes,
              ),
            );

            const completionEntries = Option.flatMap(extracted, (meta) => {
              const text = meta.document.getText(
                Range.create(
                  meta.document.offsetToPosition(meta.cursorOffset - 1),
                  meta.document.offsetToPosition(meta.cursorOffset + 1),
                ),
              );
              if (text === '``') {
                return Option.some(
                  Completions.getAllCompletionRules(
                    twinService.completions,
                    Range.create(
                      meta.document.offsetToPosition(meta.cursorOffset),
                      meta.document.offsetToPosition(meta.cursorOffset + 1),
                    ),
                  ),
                );
              }
              return Option.map(
                meta.languageRegionAtPosition.getParsedNodeAtOffset(meta.cursorOffset),
                (x) => {
                  const tokens = getCompletionsForTokens(x.flattenToken, twinService);
                  return Completions.completionRulesToEntries(
                    x.flattenToken,
                    tokens,
                    meta.document,
                  );
                },
              );
            });
            return Option.getOrElse(completionEntries, (): VscodeCompletionItem[] => []);
          });
        },
        getCompletionEntryDetails(entry, _cancelToken) {
          return Effect.gen(function* () {
            return yield* Effect.Do.pipe(
              () =>
                Effect.succeed({
                  twinRules: twinService.completions.twinRules,
                  context: createStyledContext(twinService.userConfig.root.rem),
                }),
              Effect.let('completionRules', ({ twinRules }) =>
                HashSet.filter(twinRules, (x) => x.completion.className === entry.label),
              ),
              Effect.let('completionEntries', ({ completionRules, context }) =>
                HashSet.map(completionRules, (x) => {
                  const sheet = twinService.tw(x.completion.className);
                  const finalSheet = getSheetEntryStyles(sheet, context);
                  const css = sheetEntriesToCss(sheet);

                  return Completions.createCompletionEntryDetails(entry, css, finalSheet);
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
        },
      };
    }),
  );
}
