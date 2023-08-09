import ts from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { populateCompletions } from './internal/tailwind';
import { ConfigurationManager } from './configuration';
import { TailwindLanguageService } from './languageService';

export class TailwindPluginCreator {
  typescript: typeof ts;
  private readonly _configManager = new ConfigurationManager();
  public constructor(typescript: typeof ts) {
    this.typescript = typescript;
  }
  create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const languageService = new TailwindLanguageService(
      this.typescript,
      info,
      this._configManager,
    );

    let enable = this._configManager.config.enable;
    this._configManager.onUpdatedConfig(() => {
      enable = this._configManager.config.enable;
    });

    populateCompletions(languageService.context).catch((error) => {
      languageService.context.logger.log(`TW: Error populating completions, ${error}`);
    });
    languageService.context.logger.log('tw: initialized');

    return {
      ...info.languageService,
      getCompletionsAtPosition: (fileName, position, options) => {
        if (enable) {
          const template = languageService.context.templateSourceHelper.getTemplate(
            fileName,
            position,
          );

          if (template) {
            return translateCompletionInfo(
              template,
              languageService.getCompletionsAtPosition(
                template,
                languageService.context.templateSourceHelper.getRelativePosition(
                  template,
                  position,
                ),
              ),
            );
          }
        }

        return info.languageService.getCompletionsAtPosition(fileName, position, options);
      },
    };
  }
}

const translateCompletionInfo = (
  context: TemplateContext,
  info: ts.CompletionInfo,
): ts.CompletionInfo => {
  return {
    ...info,
    entries: info.entries.map((entry) => translateCompletionEntry(context, entry)),
  };
};

const translateCompletionEntry = (
  context: TemplateContext,
  entry: ts.CompletionEntry,
): ts.CompletionEntry => {
  return {
    ...entry,
    replacementSpan: entry.replacementSpan
      ? translateTextSpan(context, entry.replacementSpan)
      : undefined,
  };
};

const translateTextSpan = (context: TemplateContext, span: ts.TextSpan): ts.TextSpan => {
  return {
    start: context.node.getStart() + 1 + span.start,
    length: span.length,
  };
};
