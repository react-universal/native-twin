import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import ts from 'typescript/lib/tsserverlibrary';
import {
  getCompletionsAtPosition,
  createCompletionEntryDetails,
} from './language-service/completions.service';
import { ConfigurationManager } from './language-service/configuration';
import { NativeTailwindIntellisense } from './language-service/intellisense.service';
import { LanguageServiceLogger } from './language-service/logger';
import { StandardTemplateSourceHelper } from './language-service/source-helper';

function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    const configManager = new ConfigurationManager();
    const logger = new LanguageServiceLogger(info);
    const intellisense = new NativeTailwindIntellisense(logger, configManager);
    const helper = new StandardTemplateSourceHelper(
      modules.typescript,
      configManager,
      new StandardScriptSourceHelper(modules.typescript, info.project),
    );

    let enable = configManager.config.enable;
    configManager.onUpdatedConfig(() => {
      enable = configManager.config.enable;
    });

    if (!enable) return proxy;

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const template = helper.getTemplate(fileName, position);

      if (template) {
        return getCompletionsAtPosition(
          template,
          helper.getRelativePosition(template, position),
          intellisense,
        );
      }

      return info.languageService.getCompletionsAtPosition(fileName, position, options);
    };

    proxy.getCompletionEntryDetails = (fileName, position, name, ...rest) => {
      const context = helper.getTemplate(fileName, position);
      if (context) {
        const utility = intellisense.completions().classes.get(name);
        if (utility) {
          return createCompletionEntryDetails(utility, intellisense.tw);
        }
      }
      return info.languageService.getCompletionEntryDetails(fileName, position, name, ...rest);
    };

    return proxy;
  }
  return {
    create,
  };
}

export = init;
