import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.models';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import * as Completions from './utils/completions.maps';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) => {
  return Effect.gen(function* () {
    const { completions: twinStore } = yield* NativeTwinManagerService;
    const documentsHandler = yield* DocumentsService;
    const twinDocument = documentsHandler.getDocument(params.textDocument);
    const templateNodeAtPosition = Option.flatMap(twinDocument, (doc) =>
      doc.getTemplateNodeAtPosition(params.position),
    );

    const completionsComposer = Completions.composeCompletionTokens(twinStore)(
      params.position,
    );

    const completionEntries = Option.zipWith(
      twinDocument,
      templateNodeAtPosition,
      (document, nodeAtPosition) => {
        const composed = completionsComposer(document, nodeAtPosition);
        return Completions.completionRulesToEntries(composed.filtered);
      },
    ).pipe(Option.getOrElse(() => []));

    return completionEntries;
  });
};

export const getCompletionEntryDetails = (
  entry: vscode.CompletionItem,
  _cancelToken: vscode.CancellationToken,
) => {
  return Effect.gen(function* (_$1) {
    const twin = yield* NativeTwinManagerService;
    const context = createStyledContext(twin.userConfig.root.rem);

    const completionRules = twin.completions.twinRules.pipe(
      HashSet.filter((x) => x.completion.className === entry.label),
    );
    const completionEntries = completionRules.pipe(
      HashSet.map((x) => {
        const sheet = twin.tw(x.completion.className);
        const finalSheet = getSheetEntryStyles(sheet, context);

        return Completions.createCompletionEntryDetails(entry, finalSheet);
      }),
    );

    const result = completionEntries.pipe(
      ReadonlyArray.fromIterable,
      ReadonlyArray.head,
      Option.getOrElse(() => entry),
    );

    return result;
  });
};

export const getQuickInfoAtPosition = (
  params: vscode.HoverParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) => {
  return Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;
    const twinManager = yield* NativeTwinManagerService;
    const context = createStyledContext(twinManager.userConfig.root.rem);
    const twinDocument = documentsHandler.getDocument(params.textDocument);

    const templateNodeAtPosition = Option.flatMap(twinDocument, (doc) =>
      doc.getTemplateNodeAtPosition(params.position),
    );

    const documentNode = Option.zipWith(
      twinDocument,
      templateNodeAtPosition,
      (document, nodeAtPosition) => {
        const relativeOffset = document.getRelativeOffset(
          nodeAtPosition,
          params.position,
        );
        const tokensAtPosition = pipe(
          nodeAtPosition.getTokensAtPosition(relativeOffset),
          // ReadonlyArray.flatMap((x) => getCompletionParts(x)),
          ReadonlyArray.filter(
            (x) => relativeOffset >= x.loc.start && relativeOffset <= x.loc.end,
          ),
        );

        return { document, nodeAtPosition, tokensAtPosition };
      },
    );

    const hoverRange = Option.map(
      documentNode,
      ({ document, nodeAtPosition, tokensAtPosition }) => {
        return pipe(
          tokensAtPosition,
          ReadonlyArray.head,
          Option.map((completion) => {
            return document.getTokenPosition(completion, nodeAtPosition.range);
          }),
        );
      },
    ).pipe(Option.flatten);

    const hoverEntry = Option.zipWith(
      documentNode,
      hoverRange,
      ({ tokensAtPosition }, range) => {
        return pipe(
          tokensAtPosition,
          ReadonlyArray.head,
          Option.map((x) => {
            const sheet = twinManager.tw(x.text);
            const finalSheet = getSheetEntryStyles(sheet, context);
            return {
              ...Completions.completionRuleToQuickInfo(finalSheet),
              range,
            };
          }),
        );
      },
    ).pipe(Option.flatten);

    return Option.getOrUndefined(hoverEntry);
  });
};
