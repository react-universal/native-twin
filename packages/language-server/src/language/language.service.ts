import * as ReadonlyArray from 'effect/Array';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as vscode from 'vscode-languageserver/node';
import { TemplateNode, TwinDocument } from '../documents/document.resource';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinManagerService } from '../native-twin/native-twin.service';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import * as Completions from './utils/completions.maps';
import { getCompletionParts } from './utils/language.utils';

export class LanguageService extends Context.Tag('language/service')<
  LanguageService,
  {
    getCompletionsAtPosition: (
      params: vscode.CompletionParams,
      _cancelToken: vscode.CancellationToken,
      _progress: vscode.WorkDoneProgressReporter,
      _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
    ) => Effect.Effect<vscode.CompletionItem[], unknown, NativeTwinManagerService>;
    getCompletionEntryDetails: (
      entry: vscode.CompletionItem,
      _cancelToken: vscode.CancellationToken,
    ) => Effect.Effect<vscode.CompletionItem, unknown, NativeTwinManagerService>;
    getQuickInfoAtPosition: (
      params: vscode.HoverParams,
      _cancelToken: vscode.CancellationToken,
      _progress: vscode.WorkDoneProgressReporter,
      _resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
    ) => Effect.Effect<vscode.Hover | undefined, unknown, NativeTwinManagerService>;
  }
>() {}

export const LanguageServiceLive = Layer.scoped(
  LanguageService,
  Effect.gen(function* ($) {
    const documentsHandler = yield* $(DocumentsService);

    return {
      getCompletionsAtPosition(params, _cancelToken, _progress, _resultProgress) {
        return Effect.gen(function* () {
          const { completions: twinStore } = yield* NativeTwinManagerService;
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
      },

      getCompletionEntryDetails(entry, _cancelToken) {
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
      },

      getQuickInfoAtPosition(params, _cancelToken, _progress, _resultProgress) {
        return Effect.gen(function* () {
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
                ReadonlyArray.flatMap((x) => getCompletionParts(x)),
                ReadonlyArray.filter(
                  (x) => relativeOffset >= x.start && relativeOffset <= x.end,
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
      },
    };
  }),
);

export const extractTokenFromNode = (
  document: TwinDocument,
  templateNode: TemplateNode,
  position: vscode.Position,
) => {
  const relativeOffset = document.getRelativeOffset(templateNode, position);
  const tokensAtPosition = pipe(
    templateNode.getTokensAtPosition(relativeOffset),
    ReadonlyArray.flatMap((x) => getCompletionParts(x)),
    ReadonlyArray.map((x) => ({
      ...x,
      documentRange: document.getTokenPosition(x, templateNode.range),
    })),
    ReadonlyArray.filter((x) => relativeOffset >= x.start && relativeOffset <= x.end),
  );

  return tokensAtPosition;
};
