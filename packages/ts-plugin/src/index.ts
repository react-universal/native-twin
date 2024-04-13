import { Effect, Layer } from 'effect';
import ts from 'typescript/lib/tsserverlibrary';
import { inspect } from 'util';
import { getCompletionsAtPosition } from './completions/completions.context';
import { ConfigurationLive } from './config-manager/configuration.context';
import { createLanguagePluginLayer } from './language/language.context';

function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }
    const command = info.session?.executeCommand({
      command: 'nativeTwin.restart',
      seq: 1,
      type: 'request',
      arguments: ['true'],
    });

    console.log('COMMAND: ', command);

    // const configManager = new ConfigurationManager();
    // const logger = new LanguageServiceLogger(info);
    // const intellisense = new NativeTailwindIntellisense(logger, configManager);
    console.log('CONFIG: ', info.config);
    console.log('CONFIG: ', info.session);
    console.log('CONFIG: ', info.languageServiceHost);
    info.languageServiceHost.log?.('asd');
    info.session?.send({
      seq: 1,
      type: 'response',
    });

    const languageServiceLayer = createLanguagePluginLayer(modules.typescript, info).pipe(
      Layer.provide(ConfigurationLive),
    );

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const runnable = Effect.provide(
        getCompletionsAtPosition(fileName, position),
        languageServiceLayer,
      );
      const data = Effect.runSync(
        runnable.pipe(
          Effect.tap((x) =>
            Effect.sync(() => {
              info.project.projectService.logger.info(
                '[@twin/language-service] NODE RESULT ' + inspect(x),
              );
            }),
          ),
        ),
      );

      console.log('DATA: ', data);

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
