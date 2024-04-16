import { SubscriptionRef } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import {
  CancellationToken,
  CompletionItem,
  CompletionList,
  CompletionParams,
  ResultProgressReporter,
  WorkDoneProgressReporter,
} from 'vscode-languageserver/node';
import { DocumentResource } from '../documents/document.resource';
import { DocumentsService } from '../documents/documents.context';
import { TwinContext } from '../services/twin.context';

export class LanguageService extends Context.Tag('language/service')<
  LanguageService,
  {
    onComPletion: (
      params: CompletionParams,
      cancelToken: CancellationToken,
      progress: WorkDoneProgressReporter,
      resultProgress: ResultProgressReporter<CompletionItem[]> | undefined,
    ) => Effect.Effect<Option.Option<CompletionList | CompletionItem[]>>;
  }
>() {}

export const LanguageServiceLive = Layer.scoped(
  LanguageService,
  Effect.gen(function* ($) {
    const documentsHandler = yield* $(DocumentsService);
    const twinContext = yield* $(TwinContext);

    return {
      onComPletion: (params, _cancel, _progress, _result) =>
        Effect.gen(function* ($1) {
          const tw = yield* $1(SubscriptionRef.get(twinContext.tw));
          const resource = new DocumentResource({
            document: Option.fromNullable(documentsHandler.get(params.textDocument.uri)),
          });
          const document = resource.getTemplateContext(params.position);
          const tokens = tw.pipe(Option.map((x) => x(`${document}`)));
          yield* $1(Effect.log(tokens));
          yield* $1(Effect.log(`DOCUMENT: ${document}`));

          return Option.some([]);
        }),
    };
  }),
);
