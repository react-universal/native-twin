import { MutableHashSet } from 'effect';
import * as ReadonlyArray from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../documents/document.resource';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinService } from '../native-twin/native-twin.service';
import { TwinRuleWithCompletion } from '../native-twin/native-twin.types';
import { TwinStore } from '../native-twin/native-twin.utils';
import { TemplateTokenWithText } from '../template/template.types';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import {
  completionRuleToQuickInfo,
  completionRulesToEntries,
  createCompletionEntryDetails,
  createCompletionsWithToken,
} from './utils/transforms';

export const getCompletionsAtPosition = (
  params: vscode.CompletionParams,
  _cancelToken: vscode.CancellationToken,
  _progress: vscode.WorkDoneProgressReporter,
  _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
) => {
  return Effect.gen(function* () {
    const documentsHandler = yield* DocumentsService;
    const twinContext = yield* NativeTwinService;
    const twinStore = yield* Ref.get(twinContext.store);

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
    ).pipe(Option.getOrElse(() => HashSet.empty<TwinRuleWithCompletion>()));

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

    const templateNodeAtPosition = Option.flatMap(twinDocument, (doc) =>
      doc.getTemplateNodeAtPosition(params.position),
    );

    const completionsComposer = composeCompletionTokens(twinStore)(params.position);

    const completionTokens = Option.zipWith(
      twinDocument,
      templateNodeAtPosition,
      (document, nodeAtPosition) =>
        completionsComposer(document, nodeAtPosition).filtered.pipe(
          HashSet.map((x) => {
            const sheet = twin.tw(x.completion.className);
            const finalSheet = getSheetEntryStyles(sheet, context);
            let quickInfo = completionRuleToQuickInfo(x, finalSheet);
            const offsetStarts = nodeAtPosition.range.start.character;
            const offsetEnds = nodeAtPosition.range.start.character;
            const startPos = document.handler.positionAt(offsetStarts);
            const endPos = document.handler.positionAt(offsetEnds);
            const hoverRange = vscode.Range.create(startPos, endPos);
            quickInfo = {
              ...quickInfo,
              range: hoverRange,
            };
            return quickInfo;
          }),
          ReadonlyArray.fromIterable,
          ReadonlyArray.head,
        ),
    ).pipe(Option.flatten);

    return completionTokens.pipe(Option.getOrUndefined);
  });
};

const composeCompletionTokens =
  (completions: TwinStore) =>
  (position: vscode.Position) =>
  (document: TwinDocument, nodeAtPosition: TemplateNode) => {
    MutableHashSet.empty<TemplateTokenWithText>();
    const relativePosition = document.getRelativePosition(
      position.character - nodeAtPosition.range.start.character,
    );
    const relativeOffset = document.getRelativeOffset(nodeAtPosition, relativePosition);

    const completionWithToken = createCompletionsWithToken(nodeAtPosition, completions);
    const tokensAtPosition = nodeAtPosition.getTokensAtPosition(relativeOffset);

    const filtered = HashSet.filter(completionWithToken, () => {
      return tokensAtPosition.some(
        (y) => relativeOffset >= y.start && relativeOffset <= y.end,
      );
    });

    return {
      relativePosition,
      relativeOffset,
      completionWithToken,
      filtered,
    };
  };
