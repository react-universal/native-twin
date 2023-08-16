import ts from 'typescript/lib/tsserverlibrary';
import { createIntellisense } from './intellisense/createIntellisense';
import { ConfigurationManager } from './language-service/configuration';
import { getCompletionEntries } from './language-service/completions.context';
import { StandardTemplateSourceHelper } from './language-service/source-helper';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { createCompletionEntryDetails } from './utils';

function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (let k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    const configManager = new ConfigurationManager();
    const intellisense = createIntellisense();
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
    const completions = Array.from(intellisense.classes.values());

    proxy.getCompletionsAtPosition = (fileName, position, options) => {
      const template = helper.getTemplate(fileName, position);

      if (template) {
        return getCompletionEntries(
          template,
          helper.getRelativePosition(template, position),
          completions,
        );
      }

      return info.languageService.getCompletionsAtPosition(fileName, position, options);
    };

    proxy.getCompletionEntryDetails = (fileName, position, name, ...rest) => {
      const context = helper.getTemplate(fileName, position);
      if (!context) {
        return info.languageService.getCompletionEntryDetails(
          fileName,
          position,
          name,
          ...rest,
        );
      }

      const utility = intellisense.classes.get(name)!;
      const css = intellisense.getCss(utility.name);
      return createCompletionEntryDetails(css);
    };

    return proxy;
  }
  return {
    create,
  };
}

export = init;
