import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/Array';
import * as Ref from 'effect/Ref';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../documents/document.resource';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinService } from '../native-twin/native-twin.service';
import { TwinRuleCompletionWithToken } from '../native-twin/native-twin.types';
import { TwinStore } from '../native-twin/native-twin.utils';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import {
  completionRuleToQuickInfo,
  completionRulesToEntries,
  createCompletionEntryDetails,
  createCompletionsWithToken,
  filterCompletionByTemplateOffset,
} from './utils/transforms';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) => {
  return Effect.gen(function* ($) {
    const documentsHandler = yield* $(DocumentsService);
    const twinContext = yield* $(NativeTwinService);
    const twinStore = yield* $(Ref.get(twinContext.store));

    const twinDocument = documentsHandler.getDocument(params.textDocument);
    const templateNodeAtPosition = Option.flatMap(twinDocument, (doc) =>
      doc.getTemplateNodeAtPosition(params.position),
    );

    const completionsComposer = composeCompletionTokens(twinStore)(params.position);

    const completionTokens = Option.zipWith(
      twinDocument,
      templateNodeAtPosition,
      (document, nodeAtPosition) =>
        completionsComposer(document, nodeAtPosition).filtered,
    ).pipe(Option.getOrElse(() => HashSet.empty<TwinRuleCompletionWithToken>()));

    const completionEntries = completionRulesToEntries(completionTokens);

    return completionEntries as vscode.CompletionItem[];
  });
};

export const getCompletionEntryDetails = (
  entry: vscode.CompletionItem,
  _cancelToken: vscode.CancellationToken,
) => {
  return Effect.gen(function* ($) {
    const twinContext = yield* $(NativeTwinService);

    const store = yield* $(Ref.get(twinContext.store));
    const twin = yield* $(twinContext.nativeTwin.get);
    const context = createStyledContext(twin.config.root.rem);

    const completionRules = store.twinRules.pipe(
      HashSet.filter((x) => x.completion.className === entry.label),
    );
    const completionEntries = completionRules.pipe(
      HashSet.map((x) => {
        const sheet = twin.tw(x.completion.className);
        const finalSheet = getSheetEntryStyles(sheet, context);

        return createCompletionEntryDetails(entry, x, finalSheet);
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
  return Effect.gen(function* ($) {
    const documentsHandler = yield* $(DocumentsService);
    const twinContext = yield* $(NativeTwinService);
    const twinStore = yield* $(Ref.get(twinContext.store));

    const twin = yield* $(twinContext.nativeTwin.get);
    const context = createStyledContext(twin.config.root.rem);
    const twinDocument = documentsHandler.getDocument(params.textDocument);
    const maybeHover = pipe(
      Option.flatMap(twinDocument, (doc) => {
        return doc.getTemplateNodeAtPosition(params.position).pipe(
          Option.map((atPosition) => {
            const relativePosition = doc.getRelativePosition(
              params.position.character - atPosition.range.start.character,
            );
            const relativeOffset = doc.getRelativeOffset(atPosition, relativePosition);

            const completionWithToken = createCompletionsWithToken(atPosition, twinStore);

            return filterCompletionByTemplateOffset(
              completionWithToken,
              relativeOffset,
            ).pipe(
              HashSet.map((x) => {
                const sheet = twin.tw(x.completion.className);
                const finalSheet = getSheetEntryStyles(sheet, context);
                let quickInfo = completionRuleToQuickInfo(x, finalSheet);
                const offsetStarts = atPosition.range.start.character + x.token.start;
                const offsetEnds = atPosition.range.start.character + x.token.end;
                const startPos = doc.internal.positionAt(offsetStarts);
                const endPos = doc.internal.positionAt(offsetEnds);
                const hoverRange = vscode.Range.create(startPos, endPos);
                quickInfo = {
                  ...quickInfo,
                  range: hoverRange,
                };
                return quickInfo;
              }),
              ReadonlyArray.fromIterable,
              ReadonlyArray.head,
            );
          }),
        );
      }),
      Option.flatten,
    );

    return maybeHover.pipe(Option.getOrUndefined);
  });
};

const composeCompletionTokens =
  (completions: TwinStore) =>
  (position: vscode.Position) =>
  (document: TwinDocument, nodeAtPosition: TemplateNode) => {
    const relativePosition = document.getRelativePosition(
      position.character - nodeAtPosition.range.start.character,
    );
    const relativeOffset = document.getRelativeOffset(nodeAtPosition, relativePosition);

    const completionWithToken = createCompletionsWithToken(nodeAtPosition, completions);

    const filtered = filterCompletionByTemplateOffset(
      completionWithToken,
      relativeOffset,
    );

    return {
      relativePosition,
      relativeOffset,
      completionWithToken,
      filtered,
    };
  };
