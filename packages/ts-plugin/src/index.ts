import * as path from 'node:path';
import { parseLSPConfigInput } from '@native-twin/language-service';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import type ts from 'typescript';
import { completions } from './completions';
import * as LSPConfig from './core/LanguageConfig.service';
import * as TsApi from './core/TypescriptAPI.service';
import { LanguageProviderService, LanguageProviderServiceLive } from './language/language.service';
import { createTwin } from './native-twin/nativeTwin.config';
import { NativeTwinServiceLive } from './native-twin/nativeTwin.service';
import { buildTSPluginService } from './plugin/TSPlugin.service';
import { LSPMainLayer, type TwinPluginLayerReq } from './RunnerLayer';
import { TemplateSourceHelperServiceLive } from './template/template.service';
import { TwinRuntimeContext } from './twin/TwinRuntime.service';

function init(modules: { typescript: typeof import('typescript') }) {
  let pluginConfig = parseLSPConfigInput({});

  let alreadyConfig = false;

  function onConfigurationChanged(config: any) {
    pluginConfig = parseLSPConfigInput(config);
    alreadyConfig = true;
  }
  function create(info: ts.server.PluginCreateInfo) {
    if (!alreadyConfig) {
      const resolved = info.serverHost.resolvePath(pluginConfig.twinConfigPath);
      const currentDir = info.project.getCurrentDirectory();
      pluginConfig.twinConfigPath = path.join(currentDir, resolved);
      pluginConfig = parseLSPConfigInput({ ...info.config, ...pluginConfig });
    }
    const proxy: ts.LanguageService = Object.create(null);

    for (const k of Object.keys(info.languageService) as Array<keyof ts.LanguageService>) {
      const x = info.languageService[k]!;
      // @ts-expect-error - JS runtime trickery which is tricky to type tersely
      proxy[k] = (...args: Array<{}>) => x.apply(info.languageService, args);
    }

    const twin = createTwin(info);
    info.project.projectService.logger.info(`configPath:${pluginConfig.twinConfigPath}`);

    function runProgram(program: ts.Program) {
      return <A, E>(execution: Effect.Effect<A, E, TwinPluginLayerReq>) => {
        const runLayer = LSPMainLayer.pipe(
          Layer.provideMerge(Layer.succeed(LSPConfig.TypeScriptPluginConfig, pluginConfig)),
          Layer.provideMerge(Layer.succeed(TsApi.TypeScriptApi, modules.typescript)),
          Layer.provideMerge(Layer.succeed(TsApi.TypeScriptProgram, program)),
        );
        return execution.pipe(Effect.provide(runLayer), Effect.runSync);
      };
    }
    const program = info.languageService.getProgram();
    if (program) {
      runProgram(program)(
        Effect.gen(function* () {
          const parser = yield* TwinRuntimeContext;
          yield* parser.bootTwinRuntime(pluginConfig.twinConfigPath);
        }),
      );
    }

    const PluginServiceLive = buildTSPluginService({
      plugin: { ts: modules.typescript, info, config: twin.pluginConfig },
      tailwind: {
        config: twin.twinConfig,
        context: twin.twin.context,
        tw: twin.twin.tw,
      },
    });

    const layer = Layer.mergeAll(NativeTwinServiceLive, TemplateSourceHelperServiceLive).pipe(
      Layer.provide(PluginServiceLive),
    );

    const createEffectRunner = (filename: string) => {
      const program = info.languageService.getProgram();
      if (!program) return null;
      const sourceFile = program?.getSourceFile(filename);
      if (!sourceFile) return null;
      return { run: runProgram(program), sourceFile };
    };

    proxy.getCompletionsAtPosition = (fileName, ...rest) => {
      const runner = createEffectRunner(fileName);
      if (!runner) return;

      const entries = runner.run(
        completions.classNameCompletions.apply(runner.sourceFile, ...rest),
      );
      return {
        entries,
        // flags: ts.CompletionInfoFlags.MayIncludeMethodSnippets,
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
      };
    };

    proxy.getCompletionEntrySymbol = (filename, position, bane, source) => {
      console.log({ filename, position, bane, source });
      return undefined;
    };
    proxy.getCompletionEntryDetails = (fileName, position, name, ...args) => {
      console.log('ARGS: ', args);
      return Effect.gen(function* ($) {
        const languageService = yield* $(LanguageProviderService);
        return yield* $(languageService.getCompletionEntryDetails(fileName, position, name));
      }).pipe(
        Effect.provide(LanguageProviderServiceLive),
        Effect.provide(layer),
        Effect.runSync,
        Option.getOrUndefined,
      );
    };

    proxy.getQuickInfoAtPosition = (fileName, position) => {
      return Effect.gen(function* ($) {
        const languageService = yield* $(LanguageProviderService);
        return yield* $(languageService.getQuickInfoAtPosition(fileName, position));
      }).pipe(
        Effect.provide(LanguageProviderServiceLive),
        Effect.provide(layer),
        Effect.runSync,
        Option.getOrUndefined,
      );
    };

    return proxy;
  }
  return {
    create,
    onConfigurationChanged(config: any) {
      return onConfigurationChanged(config);
    },
  };
}

export = init;
