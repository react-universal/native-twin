import ts from 'typescript/lib/tsserverlibrary';
import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import { createLogFunction } from './_logger';
import { LanguageServiceContext, createLanguageService } from './_language-service';
import { populateCompletions } from './tailwind';
import { join } from 'path';

export = function init(mod: { typescript: typeof ts }) {
  let initialized = false;
  const context: LanguageServiceContext = {
    completionEntries: new Map(),
  };
  return {
    create(info: ts.server.PluginCreateInfo) {
      const log = createLogFunction(info);

      const configPath = join(info.project.getCurrentDirectory(), 'tailwind.config.js');

      if (!initialized) {
        populateCompletions(context, configPath)
          .catch((error) => {
            log('an error occured:', String(error));
          })
          .then(() => {
            log('populateCompletions done');
          });
        log('initializing');
        initialized = true;
      } else {
        log('already initialized');
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
