import ts from 'typescript/lib/tsserverlibrary';
import { join } from 'path';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { populateCompletions } from './internal/tailwind';
import { ConfigurationManager } from './configuration';
import { StandardTemplateSourceHelper } from './source-helper';
import { TailwindLanguageService } from './LanguageService';
import { LanguageServiceLogger } from './logger';

export class TailwindPluginCreator {
  typescript: typeof ts;
  private _logger?: LanguageServiceLogger;
  private readonly _configManager = new ConfigurationManager();
  public constructor(typescript: typeof ts) {
    this.typescript = typescript;
  }
  create(info: ts.server.PluginCreateInfo): ts.LanguageService {
    this._logger = new LanguageServiceLogger(info);

    const helper = new StandardTemplateSourceHelper(
      this.typescript,
      this._configManager,
      new StandardScriptSourceHelper(this.typescript, info.project),
    );
    const languageService = new TailwindLanguageService(info);

    let enable = this._configManager.config.enable;
    this._configManager.onUpdatedConfig(() => {
      enable = this._configManager.config.enable;
    });
    const configPath = join(info.project.getCurrentDirectory(), 'tailwind.config.js');

    populateCompletions(context, configPath);
    this._logger.log('tw: initialized');

    return {
      ...info.languageService,
      getCompletionsAtPosition: (fileName, position, options) => {
        if (enable) {
          const template = helper.getTemplate(fileName, position);

          if (template) {
            return translateCompletionInfo(
              template,
              languageService.getCompletionsAtPosition!(
                template,
                helper.getRelativePosition(template, position),
              ),
            );
          }
        }

        return info.languageService.getCompletionsAtPosition!(fileName, position, options);
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
