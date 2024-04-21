import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import ts from 'typescript/lib/tsserverlibrary';
import { getCompletionsAtPosition } from './completions/completions.context';
import { createTwin } from './intellisense/intellisense.config';
import { IntellisenseServiceLive } from './language/intellisense.service';
import { buildTSPluginService } from './plugin/ts-plugin.context';
import { createTemplateService } from './template/template.services';

function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    // const configManager = new ConfigurationManager();
    // const logger = new LanguageServiceLogger(info);
    // const intellisense = new NativeTailwindIntellisense(logger, configManager);
    const twin = createTwin(info);

    const PluginServiceLive = buildTSPluginService({
      plugin: { ts: modules.typescript, info, config: twin.pluginConfig },
      tailwind: {
        config: twin.twinConfig,
        context: twin.twin.context,
        tw: twin.twin.tw,
      },
    });

    const TemplateServiceLive = createTemplateService(modules.typescript, info);

    const layer = Layer.mergeAll(IntellisenseServiceLive, TemplateServiceLive);

    proxy.getCompletionsAtPosition = (fileName, position, _options) => {
      const runnable = Effect.provide(
        getCompletionsAtPosition(fileName, position),
        layer,
      ).pipe(Effect.provide(PluginServiceLive));

      const data = Effect.runSync(runnable);

      console.log('DATA: ', data);

      return {
        entries: [],
        isGlobalCompletion: false,
        isMemberCompletion: true,
        isNewIdentifierLocation: true,
      };

      // info.project.log(inspect(data, false, 3));
      // info.languageServiceHost.log?.(inspect(data, false, 3));
      // return info.languageService.getCompletionsAtPosition(fileName, position, options);

      // if (template) {
      //   return getCompletionsAtPosition(
      //     template,
      //     helper.getRelativePosition(template, position),
      //     intellisense,
      //   );
      // }

      // return info.languageService.getCompletionsAtPosition(fileName, position, options);
    };

    // proxy.getCompletionEntryDetails = (fileName, position, name, ...rest) => {
    //   const context = helper.getTemplate(fileName, position);
    //   if (context) {
    //     const utility = intellisense.completions().classes.get(name);
    //     if (utility) {
    //       return createCompletionEntryDetails(utility, intellisense.tw);
    //     }
    //   }
    //   return info.languageService.getCompletionEntryDetails(fileName, position, name, ...rest);
    // };

    return proxy;
  }
  return {
    create,
  };
}

export = init;
