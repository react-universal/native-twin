import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import { TemplateSourceHelperService } from '../template/template.services';

export class CompletionsService extends Context.Tag('ts/completions')<
  CompletionsService,
  {
    getCompletionsAtPosition(fileName: string, position: number): Effect.Effect<any>;
  }
>() {}

export const getCompletionsAtPosition = (filename: string, position: number) =>
  Effect.gen(function* ($) {
    const templateContext = yield* $(TemplateSourceHelperService);
    return templateContext.getTemplateNode(filename, position);
  });
