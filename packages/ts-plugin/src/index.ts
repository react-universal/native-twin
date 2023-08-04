import ts from 'typescript/lib/tsserverlibrary';
import { join } from 'path';
import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import { createLogFunction } from './utils/logger';
import { LanguageServiceContext, createLanguageService } from './language-service';
import { populateCompletions } from './tailwind';

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
        log('initializing');
        initialized = true;
        populateCompletions(context, configPath)
          .catch((error) => {
            log('an error occurred:', String(error));
          })
          .then(() => {
            log('populateCompletions done');
          });
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
        {
          logger: { log },
        },
      );
    },
  };
};
