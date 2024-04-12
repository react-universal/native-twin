import { Effect } from 'effect';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import ts from 'typescript/lib/tsserverlibrary';
import { inspect } from 'util';
import {
  LanguageService,
  LanguageServiceLive,
  LanguageTemplateSourceContext,
} from './language/template.context';

function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    // const configManager = new ConfigurationManager();
    // const logger = new LanguageServiceLogger(info);
    // const intellisense = new NativeTailwindIntellisense(logger, configManager);

    const PluginEffect = Effect.provideService(
      LanguageTemplateSourceContext,
      new StandardScriptSourceHelper(modules.typescript, info.project),
    );
    const PluginContext = Effect.provide(LanguageService, LanguageServiceLive);

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const data = Effect.runSync(PluginEffect(PluginContext))
        .getTemplateNode(fileName, position)
        .pipe(Effect.tap((x) => Effect.log(`TEMPLATE: ${x}`)));

      info.project.log(inspect(data, false, 3));
      info.languageServiceHost.log?.(inspect(data, false, 3));
      return info.languageService.getCompletionsAtPosition(fileName, position, options);

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
