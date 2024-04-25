import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as HashSet from 'effect/HashSet';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as ReadonlyArray from 'effect/ReadonlyArray';
import ts from 'typescript/lib/tsserverlibrary';
import { NativeTwinService } from '../native-twin/nativeTwin.service';
import { acquireTemplateNode } from '../template/TemplateNode.service';
import { TemplateSourceHelperService } from '../template/template.context';
import { createCompletionEntryDetails } from './utils/language.utils';
import {
  completionRulesToEntries,
  completionRulesToQuickInfo,
  createCompletionsWithToken,
  filterCompletionByTemplateOffset,
} from './utils/transforms';

export class LanguageProviderService extends Context.Tag('providers/hover')<
  LanguageProviderService,
  {
    getQuickInfoAtPosition: (
      filename: string,
      position: number,
    ) => Effect.Effect<
      Option.Option<ts.QuickInfo>,
      never,
      TemplateSourceHelperService | NativeTwinService
    >;
    getCompletionsAtPosition: (
      filename: string,
      position: number,
    ) => Effect.Effect<
      ts.CompletionEntry[],
      never,
      TemplateSourceHelperService | NativeTwinService
    >;
    getCompletionEntryDetails: (
      fileName: string,
      position: number,
      name: string,
    ) => Effect.Effect<Option.Option<ts.CompletionEntryDetails>>;
  }
>() {}

export const LanguageProviderServiceLive = Layer.scoped(
  LanguageProviderService,
  Effect.gen(function* ($) {
    const twinService = yield* $(NativeTwinService);

    return {
      getCompletionsAtPosition(filename, position) {
        return Effect.gen(function* ($) {
          const resource = yield* $(acquireTemplateNode(filename, position));
          const completionTokens = yield* $(createCompletionsWithToken(resource));
          const completionRules = filterCompletionByTemplateOffset(
            completionTokens,
            Option.map(resource, (x) => x.positions.relative.offset).pipe(
              Option.getOrElse(() => 0),
            ),
          );

          const completionEntries = Option.map(resource, (node) =>
            completionRulesToEntries(node, completionRules),
          );

          return completionEntries.pipe(
            Option.getOrElse(() => []),
          ) as ts.CompletionEntry[];
        });
      },
      getQuickInfoAtPosition(filename, position) {
        return Effect.gen(function* ($) {
          const resource = yield* $(acquireTemplateNode(filename, position));
          const completionTokens = yield* $(createCompletionsWithToken(resource));

          const completionRules2 = filterCompletionByTemplateOffset(
            completionTokens,
            Option.map(resource, (x) => x.positions.relative.offset).pipe(
              Option.getOrElse(() => 0),
            ),
          );

          const quickInfo = Option.flatMap(resource, (node) => {
            return completionRulesToQuickInfo(node, completionRules2);
          });

          return quickInfo;
        });
      },
      getCompletionEntryDetails(fileName, position, name) {
        return Effect.sync(function () {
          const completionEntryDetails = twinService.store.twinRules.pipe(
            HashSet.filter((x) => x.completion.className === name),
            HashSet.map((x) => createCompletionEntryDetails(x)),
            HashSet.values,
            (x) => Array.from(x),
            ReadonlyArray.fromIterable,
            ReadonlyArray.head,
          );

          return completionEntryDetails;
        });
      },
    };
  }),
);
