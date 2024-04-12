import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'typescript';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { TSPluginContext } from '../completions/ts-plugin.context';
import { getValidTemplateNode } from './template.utils';

export class LanguageTemplateSourceContext extends Context.Tag('ts/template/source-helper')<
  LanguageTemplateSourceContext,
  StandardScriptSourceHelper
>() {}

export const LanguageTemplateHelperLive = Layer.effect(
  LanguageTemplateSourceContext,
  Effect.gen(function* ($) {
    const plugin = yield* $(TSPluginContext);

    return new StandardScriptSourceHelper(plugin.ts, plugin.info.project);
  }),
);

export class LanguageService extends Context.Tag('ts/template/context')<
  LanguageService,
  {
    getTemplateNode: (
      fileName: string,
      position: number,
    ) => Option.Option<
      ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
    >;
  }
>() {}

export const LanguageServiceLive = Layer.scoped(
  LanguageService,
  Effect.gen(function* ($) {
    const helper = yield* $(LanguageTemplateSourceContext);

    return {
      getTemplateNode(fileName, position) {
        return Option.fromNullable(helper.getNode(fileName, position))
          .pipe(
            Option.flatMap((x) => {
              return Option.fromNullable(getValidTemplateNode(x));
            }),
          )
          .pipe(Option.filter((x) => position <= x.pos));
      },
    };
  }),
);
