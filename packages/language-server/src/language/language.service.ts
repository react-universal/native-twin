import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import * as Completions from './utils/completions.maps';
import {
  extractTokensAtPositionFromTemplateNode,
  getFlattenTemplateToken,
  getRangeFromTokensAtPosition,
} from './utils/language.utils';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
): Effect.Effect<
  vscode.CompletionItem[],
  never,
  DocumentsService | NativeTwinManagerService
> => {
  return Effect.gen(function* () {
    const { completions: twinStore } = yield* NativeTwinManagerService;
    const documentsHandler = yield* DocumentsService;

    const completionEntries = Option.Do.pipe(
      () => Option.some({}),
      Option.bind('document', () => documentsHandler.getDocument(params.textDocument)),
      Option.bind('nodeAtPosition', ({ document }) =>
        document.getTemplateNodeAtPosition(params.position),
      ),
      Option.let('relativePosition', ({ nodeAtPosition, document }) =>
        document.getRelativePosition(
          params.position.character - nodeAtPosition.range.start.character,
        ),
      ),
      Option.let('relativeOffset', ({ nodeAtPosition, document, relativePosition }) =>
        document.getRelativeOffset(nodeAtPosition, relativePosition),
      ),
      Option.let('completionWithToken', ({ nodeAtPosition }) =>
        Completions.createCompletionsWithToken(nodeAtPosition, twinStore),
      ),
      Option.let('tokensAtPosition', ({ nodeAtPosition, relativeOffset }) =>
        nodeAtPosition.getTokensAtPosition(relativeOffset),
      ),
      Option.let('flattenCompletions', ({ tokensAtPosition, relativeOffset }) =>
        tokensAtPosition
          .flatMap((x) => getFlattenTemplateToken(x))
          .filter((x) => {
            return relativeOffset >= x.loc.start && relativeOffset <= x.loc.end;
          }),
      ),
      Option.let('filteredCompletions', ({ completionWithToken, flattenCompletions }) =>
        HashSet.filter(completionWithToken, (x) => {
          return flattenCompletions.some((y) =>
            x.completion.className.startsWith(y.text),
          );
        }),
      ),
      Option.match({
        onSome: (a) => Completions.completionRulesToEntries(a.filteredCompletions),
        onNone: (): vscode.CompletionItem[] => [],
      }),
    );

    return completionEntries;
  });
};

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

export const getQuickInfoAtPosition = (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
): Effect.Effect<
  vscode.Hover | undefined,
  never,
  DocumentsService | NativeTwinManagerService
> => {
  return Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;
    const twinManager = yield* NativeTwinManagerService;
    const context = createStyledContext(twinManager.userConfig.root.rem);

    const hoverEntry = Option.Do.pipe(
      () => Option.some({}),
      Option.bind('document', () => documentsHandler.getDocument(params.textDocument)),
      Option.bind('nodeAtPosition', ({ document }) =>
        document.getTemplateNodeAtPosition(params.position),
      ),
      Option.bind('tokensWithText', ({ document, nodeAtPosition }) =>
        Option.some(
          extractTokensAtPositionFromTemplateNode(
            document,
            nodeAtPosition,
            params.position,
          ),
        ),
      ),
      Option.bind('firstToken', ({ tokensWithText }) =>
        ReadonlyArray.head(tokensWithText),
      ),
      Option.bind('hoverRange', ({ document, tokensWithText, nodeAtPosition }) =>
        ReadonlyArray.head(
          getRangeFromTokensAtPosition(document, nodeAtPosition, tokensWithText),
        ),
      ),
      Option.let('finalSheet', ({ firstToken }) =>
        getSheetEntryStyles(twinManager.tw(firstToken.text), context),
      ),
      Option.map((x) =>
        Completions.completionRuleToQuickInfo(x.finalSheet, x.hoverRange),
      ),
    );

    return Option.getOrUndefined(hoverEntry);
  });
};
