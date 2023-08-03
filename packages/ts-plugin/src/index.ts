import ts from 'typescript/lib/tsserverlibrary';
import { decorateWithTemplateLanguageService } from 'typescript-template-language-service-decorator';
import { createLogFunction } from './utils/logger';
import { LanguageServiceContext, createLanguageService } from './language-service';
import { populateCompletions } from './tailwind';
import { join } from 'path';
import presetTailwind from '@twind/preset-tailwind';

const completionsAPI = async (log: any) => {
  const module = await import('@twind/intellisense');
  const completions = module.createIntellisense({
    presets: [presetTailwind({ disablePreflight: true })],
  });
  // log([...completions.enumerate()]);
  // completions.suggestAt('bg', 2, 'typescriptreact').then((result) => {
  //   log(result);
  // });
  completions.suggest('bg').then((result) => {
    log(result);
  });
};

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
        completionsAPI(log);
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
