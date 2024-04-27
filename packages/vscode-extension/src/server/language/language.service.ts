import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { pipe } from 'effect/Function';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import * as Ref from 'effect/Ref';
import * as vscode from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.service';
import { NativeTwinService } from '../native-twin/nativeTwin.service';
import { TwinRuleCompletionWithToken } from '../native-twin/nativeTwin.types';
import { createStyledContext, getSheetEntryStyles } from '../utils/sheet.utils';
import {
  completionRuleToQuickInfo,
  completionRulesToEntries,
  createCompletionEntryDetails,
  createCompletionsWithToken,
  filterCompletionByTemplateOffset,
} from './utils/transforms';

export class LanguageService extends Context.Tag('language/service')<
  LanguageService,
  {
    onComPletion: (
      params: vscode.CompletionParams,
      cancelToken: vscode.CancellationToken,
      progress: vscode.WorkDoneProgressReporter,
      resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
    ) => Effect.Effect<vscode.CompletionList | vscode.CompletionItem[]>;

    onCompletionResolve: (
      params: vscode.CompletionItem,
      cancelToken: vscode.CancellationToken,
    ) => Effect.Effect<vscode.CompletionItem>;

    onHover: (
      params: vscode.HoverParams,
      cancelToken: vscode.CancellationToken,
      progress: vscode.WorkDoneProgressReporter,
      resultProgress: vscode.ResultProgressReporter<vscode.CompletionItem[]> | undefined,
    ) => Effect.Effect<Option.Option<vscode.Hover>>;
  }
>() {}

export const LanguageServiceLive = Layer.scoped(
  LanguageService,
  Effect.gen(function* ($) {
    const documentsHandler = yield* $(DocumentsService);
    const twinContext = yield* $(NativeTwinService);

    return {
      onCompletionResolve: (entry, _cancelToken) => {
        return Effect.gen(function* ($) {
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
      },
      onComPletion: (params, _cancel, _progress, _result) =>
        Effect.gen(function* ($1) {
          const twinStore = yield* $1(Ref.get(twinContext.store));
          const twinDocument = documentsHandler.getDocument(params.textDocument);
          const completionTokens = pipe(
            Option.flatMap(twinDocument, (doc) => {
              return doc.getTemplateNodeAtPosition(params.position).pipe(
                Option.map((atPosition) => {
                  const text = atPosition.node.getText();
                  const parsed = atPosition.parsedNode;
                  console.log(text, parsed);
                  const completionWithToken = createCompletionsWithToken(
                    atPosition,
                    twinStore,
                  );
                  const relativePosition = doc.getRelativePosition(
                    params.position.character - atPosition.range.start.character,
                  );
                  const relativeOffset = doc.getRelativeOffset(
                    atPosition,
                    relativePosition,
                  );
                  const filtered = filterCompletionByTemplateOffset(
                    completionWithToken,
                    relativeOffset,
                  );
                  return filtered;
                }),
              );
            }),
            Option.getOrElse(() => HashSet.empty<TwinRuleCompletionWithToken>()),
          );

          const completionEntries = completionRulesToEntries(completionTokens);

          return completionEntries as vscode.CompletionItem[];
        }),

      onHover(params) {
        return Effect.gen(function* ($1) {
          const twin = yield* $(twinContext.nativeTwin.get);
          const context = createStyledContext(twin.config.root.rem);
          const twinStore = yield* $1(Ref.get(twinContext.store));
          const twinDocument = documentsHandler.getDocument(params.textDocument);
          const maybeHover = pipe(
            Option.flatMap(twinDocument, (doc) => {
              return doc.getTemplateNodeAtPosition(params.position).pipe(
                Option.map((atPosition) => {
                  const completionWithToken = createCompletionsWithToken(
                    atPosition,
                    twinStore,
                  );
                  const relativePosition = doc.getRelativePosition(
                    params.position.character - atPosition.range.start.character,
                  );
                  const relativeOffset = doc.getRelativeOffset(
                    atPosition,
                    relativePosition,
                  );
                  return filterCompletionByTemplateOffset(
                    completionWithToken,
                    relativeOffset,
                  ).pipe(
                    HashSet.map((x) => {
                      const sheet = twin.tw(x.completion.className);
                      const finalSheet = getSheetEntryStyles(sheet, context);
                      let quickInfo = completionRuleToQuickInfo(x, finalSheet);
                      const offsetStarts =
                        atPosition.range.start.character + x.token.start;
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

          return maybeHover as Option.Option<vscode.Hover>;
        });
      },
    };
  }),
);
