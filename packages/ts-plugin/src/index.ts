import ts from 'typescript/lib/tsserverlibrary';
import { join } from 'path';
import { TemplateContext } from 'typescript-template-language-service-decorator';
import StandardScriptSourceHelper from 'typescript-template-language-service-decorator/lib/standard-script-source-helper';
import { populateCompletions } from './internal/tailwind';
import { ConfigurationManager } from './configuration';
import { StandardTemplateSourceHelper } from './source-helper';
import { TailwindLanguageService } from './LanguageService';
import { LanguageServiceContext } from './types';

export = function init(mod: { typescript: typeof ts }) {
  let initialized = false;
  const context: LanguageServiceContext = {
    completionEntries: new Map(),
  };
  const configManager = new ConfigurationManager();
  return {
    create(info: ts.server.PluginCreateInfo): ts.LanguageService {
      const helper = new StandardTemplateSourceHelper(
        mod.typescript,
        configManager,
        new StandardScriptSourceHelper(mod.typescript, info.project),
      );
      const languageService = new TailwindLanguageService(context, info);
      let enable = configManager.config.enable;
      configManager.onUpdatedConfig(() => {
        enable = configManager.config.enable;
      });
      const configPath = join(info.project.getCurrentDirectory(), 'tailwind.config.js');

      if (!initialized) {
        populateCompletions(context, configPath);
        initialized = true;
      }
      info.project.projectService.logger.info('tw: initialized');
      return {
        ...info.languageService,
        getCompletionsAtPosition: (fileName, position, options) => {
          if (enable) {
            const context = helper.getTemplate(fileName, position);

            if (context) {
              return translateCompletionInfo(
                context,
                languageService.getCompletionsAtPosition!(
                  context,
                  helper.getRelativePosition(context, position),
                ),
              );
            }
          }

          return info.languageService.getCompletionsAtPosition!(fileName, position, options);
        },
      };

      // return decorateWithTemplateLanguageService(
      //   mod.typescript,
      //   info.languageService,
      //   info.project,
      //   createLanguageService(context, info),
      //   { tags: ['tw', 'css', 'styled'] },
      // );
    },
  };
};

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
