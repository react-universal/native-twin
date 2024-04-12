import * as Context from 'effect/Context';
// import * as Effect from 'effect/Effect';
// import { TemplateContext } from 'typescript-template-language-service-decorator';

export class CompletionsContext extends Context.Tag('ts/completions')<
  CompletionsContext,
  {}
>() {}

