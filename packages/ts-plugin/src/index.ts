import ts from 'typescript/lib/tsserverlibrary';
import { join } from 'path';
import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import { LanguageServiceContext, createLanguageService } from './languageService';
import { populateCompletions } from './tailwind';

export = function init(mod: { typescript: typeof ts }) {
  let initialized = false;
  const context: LanguageServiceContext = {
    completionEntries: new Map(),
  };
  return {
    create(info: ts.server.PluginCreateInfo) {
      const configPath = join(info.project.getCurrentDirectory(), 'tailwind.config.js');

      if (!initialized) {
        populateCompletions(context, configPath);
        initialized = true;
      }
      info.serverHost.trace?.('tw: initialized');

      return decorateWithTemplateLanguageService(
        mod.typescript,
        info.languageService,
        info.project,
        createLanguageService(context, info),
        { tags: ['tw', 'css', 'styled'] },
      );
    },
  };
};
