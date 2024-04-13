import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import ts from 'typescript';
import { ConfigurationLive } from '../config-manager/configuration.context';
import { TSPluginService } from '../plugin/ts-plugin.context';
import {
  TemplateSourceHelperService,
  TemplateSourceHelperServiceLiveProvider,
} from '../template/template.services';

export class LanguageService extends Context.Tag('ts/template/context')<
  LanguageService,
  {
    getCompletionsAtPosition(
      filename: string,
      position: number,
    ): Effect.Effect<
      Option.Option<
        ts.StringLiteral | ts.NoSubstitutionTemplateLiteral | ts.TemplateExpression
      >,
      never,
      TemplateSourceHelperService
    >;
  }
>() {}

export const createLanguagePluginLayer = (
  typescript: typeof ts,
  info: ts.server.PluginCreateInfo,
) => {
  const pluginContext = Layer.scoped(
    TSPluginService,
    Effect.sync(() =>
      TSPluginService.of({
        info,
        ts: typescript,
      }),
    ),
  );

  const sourceHelper = TemplateSourceHelperServiceLiveProvider(typescript, info);

  return Layer.mergeAll(ConfigurationLive, pluginContext, sourceHelper);
};
