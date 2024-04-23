import { Option } from 'effect';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import ts from 'typescript/lib/tsserverlibrary';
import {
  getCompletionEntryDetails,
  getCompletionsAtPosition,
} from './completions/completions.context';
import { NativeTwinServiceLive } from './native-twin/nativeTwin.service';
import { buildTSPluginService } from './plugin/TSPlugin.service';
import { createTwin } from './plugin/nativeTwin.config';
import { TemplateSourceHelperServiceLive } from './template/template.service';

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

    const layer = Layer.mergeAll(
      NativeTwinServiceLive,
      TemplateSourceHelperServiceLive,
    ).pipe(Layer.provide(PluginServiceLive));

    proxy.getCompletionsAtPosition = (fileName, position, _options, _formatSettings) => {
      const runnable = Effect.provide(
        getCompletionsAtPosition(fileName, position),
        layer,
      );

      const completionEntries = Effect.runSync(runnable);

      return {
        entries: completionEntries,
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
      };
    };

    proxy.getCompletionEntryDetails = (fileName, position, name) => {
      const runnable = Effect.provide(
        getCompletionEntryDetails(fileName, position, name),
        layer,
      );

      const completionEntries = Effect.runSync(runnable);

      return Option.match(completionEntries, {
        onNone: () => undefined,
        onSome: (x) => x,
      });
    };

    return proxy;
  }
  return {
    create,
  };
}

export = init;
