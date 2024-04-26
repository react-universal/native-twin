import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import * as Ref from 'effect/Ref';
import {
  CancellationToken,
  CompletionItem,
  CompletionList,
  CompletionParams,
  Hover,
  HoverParams,
  ResultProgressReporter,
  WorkDoneProgressReporter,
} from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.context';
import { NativeTwinService } from '../native-twin/nativeTwin.service';
import { acquireTemplateNode } from '../template/TemplateNode.service';
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
      params: CompletionParams,
      cancelToken: CancellationToken,
      progress: WorkDoneProgressReporter,
      resultProgress: ResultProgressReporter<CompletionItem[]> | undefined,
    ) => Effect.Effect<CompletionList | CompletionItem[]>;

    onCompletionResolve: (
      params: CompletionItem,
      cancelToken: CancellationToken,
    ) => Effect.Effect<CompletionItem>;

    onHover: (
      params: HoverParams,
      cancelToken: CancellationToken,
      progress: WorkDoneProgressReporter,
      resultProgress: ResultProgressReporter<CompletionItem[]> | undefined,
    ) => Effect.Effect<Option.Option<Hover>>;
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
          const document = acquireTemplateNode(
            params.position,
            documentsHandler.get(params.textDocument.uri),
          );

          const completionTokens = yield* $1(
            createCompletionsWithToken(document, twinStore),
          );

          const completionRules = filterCompletionByTemplateOffset(
            completionTokens,
            Option.map(document, (x) => x.positions.relative.offset).pipe(
              Option.getOrElse(() => 0),
            ),
          );

          // yield* $1(Effect.log(`DOCUMENT: ${document} ${completionTokens}`));

          const completionEntries = completionRulesToEntries(completionRules);

          return completionEntries;
        }),

      onHover(params) {
        return Effect.gen(function* ($1) {
          const twin = yield* $(twinContext.nativeTwin.get);
          const twinStore = yield* $1(Ref.get(twinContext.store));
          const document = acquireTemplateNode(
            params.position,
            documentsHandler.get(params.textDocument.uri),
          );
          const context = createStyledContext(twin.config.root.rem);

          const completionTokens = yield* $1(
            createCompletionsWithToken(document, twinStore),
          );

          const maybeHover = filterCompletionByTemplateOffset(
            completionTokens,
            Option.map(document, (x) => x.positions.relative.offset).pipe(
              Option.getOrElse(() => 0),
            ),
          ).pipe(
            HashSet.map((x) => {
              const sheet = twin.tw(x.completion.className);
              const finalSheet = getSheetEntryStyles(sheet, context);
              return completionRuleToQuickInfo(x, finalSheet);
            }),
            ReadonlyArray.fromIterable,
            ReadonlyArray.head,
          );

          return maybeHover;
        });
      },
    };
  }),
);
