import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import ts from 'typescript/lib/tsserverlibrary';
import { getCompletionsAtPosition } from './completions/completions.context';
import { createTwin } from './intellisense/intellisense.config';
import { IntellisenseServiceLive } from './intellisense/intellisense.service';
import { buildTSPluginService } from './plugin/ts-plugin.context';
import { createTemplateService } from './template/template.services';

function init(modules: { typescript: typeof import('typescript/lib/tsserverlibrary') }) {
  function create(info: ts.server.PluginCreateInfo) {
    const proxy: ts.LanguageService = Object.create(null);
    for (const k of Object.keys(info.languageService) as Array<
      keyof ts.LanguageService
    >) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    // const configManager = new ConfigurationManager();
    // const logger = new LanguageServiceLogger(info);
    // const intellisense = new NativeTailwindIntellisense(logger, configManager);
    const twin = createTwin(info);

    const PluginServiceLive = buildTSPluginService({
      plugin: { ts: modules.typescript, info, config: twin.pluginConfig },
      tailwind: {
        config: twin.twinConfig,
        context: twin.twin.context,
        tw: twin.twin.tw,
      },
    });

    const TemplateServiceLive = createTemplateService(modules.typescript, info);

    const layer = Layer.mergeAll(IntellisenseServiceLive, TemplateServiceLive);

    proxy.getCompletionEntrySymbol = (filename, position, name, source) => {
      const result = info.languageService.getCompletionEntrySymbol(
        filename,
        position,
        name,
        source,
      );
      return result;
    };

    proxy.getCompletionsAtPosition = (fileName, position, _options, _formatSettings) => {
      const original = info.languageService.getCompletionsAtPosition(
        fileName,
        position,
        _options,
        _formatSettings,
      );
      console.log('ORIGINAL: ', original);
      const runnable = Effect.provide(
        getCompletionsAtPosition(fileName, position),
        layer,
      ).pipe(Effect.provide(PluginServiceLive));

      const completionEntries = Effect.runSync(runnable);

      return {
        entries: completionEntries,
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
      };
    };

    proxy.getCompletionEntryDetails = (
      fileName,
      position,
      name,
      _format,
      _source,
      _preferences,
      _data,
    ) => {
      const original = info.languageService.getCompletionEntryDetails(
        fileName,
        position,
        name,
        _format,
        _source,
        _preferences,
        _data,
      );
      return original;
    };

    return proxy;
  }
  return {
    create,
  };
}

export = init;
