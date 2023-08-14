import ts from 'typescript/lib/tsserverlibrary';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import { ConfigurationManager } from './language-service/configuration';
import { TailwindLanguageService } from './language-service/service';
import { createIntellisense } from './intellisense/createIntellisense';

export class TailwindPluginCreator {
  typescript: typeof ts;
  private readonly _configManager = new ConfigurationManager();
  public constructor(typescript: typeof ts) {
    this.typescript = typescript;
  }
  create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    const intellisense = createIntellisense();
    const languageService = new TailwindLanguageService(
      this.typescript,
      info,
      this._configManager,
      intellisense,
    );

    let enable = this._configManager.config.enable;
    this._configManager.onUpdatedConfig(() => {
      enable = this._configManager.config.enable;
    });

    return {
      ...info.languageService,
      getCompletionEntryDetails: (fileName, position, name, ...rest) => {
        if (enable && languageService.configManager.config.enable) {
          const context = languageService.templateSourceHelper.getTemplate(fileName, position);

          if (context) {
            return languageService.getCompletionEntryDetails(
              context,
              languageService.templateSourceHelper.getRelativePosition(context, position),
              name,
            );
          }
        }

        return info.languageService.getCompletionEntryDetails(
          fileName,
          position,
          name,
          ...rest,
        );
      },
      getCompletionsAtPosition: (fileName, position, options) => {
        if (enable) {
          const template = languageService.templateSourceHelper.getTemplate(
            fileName,
            position,
          );

          if (template) {
            return translateCompletionInfo(
              template,
              languageService.getCompletionsAtPosition(
                template,
                languageService.templateSourceHelper.getRelativePosition(template, position),
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
