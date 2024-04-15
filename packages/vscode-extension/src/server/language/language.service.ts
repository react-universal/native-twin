import { Context, Effect, Layer, Option } from 'effect';
import {
  CancellationToken,
  CompletionItem,
  CompletionList,
  CompletionParams,
  ResultProgressReporter,
  WorkDoneProgressReporter,
  Range,
} from 'vscode-languageserver/node';
import { DocumentsService } from '../documents/documents.context';
import { getTemplateTS } from './language-parser';

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
    return {
      onComPletion: (params, _cancel, _progress, _result) =>
        Effect.gen(function* ($1) {
          const document = Option.fromNullable(
            documentsHandler.get(params.textDocument.uri),
          ).pipe(
            Option.map((x) => ({
              document: x,
              template: getTemplateTS(x, params.position),
            })),
            Option.map((x) => {
              return {
                ...x,
                text: x.document.getText(
                  Range.create(
                    x.document.positionAt(x.template.templateStart),
                    x.document.positionAt(x.template.templateEnd),
                  ),
                ),
              };
            }),
          );
          yield* $1(Effect.log(document));

          return Option.some([]);
        }),
    };
  }),
);
