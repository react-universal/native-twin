import { Stream } from 'effect';
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { TwinParserContext } from '../twin/TwinParser.service.js';
import { TwinRuntimeContext } from '../twin/TwinRuntime.service.js';
import { getClientCapabilities } from '../utils/connection.utils.js';
import {
  DEFAULT_PLUGIN_CONFIG,
  type NativeTwinPluginConfiguration,
} from '../utils/constants.utils.js';
import { LSPConnectionService } from './LSPConnection.service.js';
import { NativeTwinManagerService } from './NativeTwinManager.service.js';

export interface VscodeLSPConfig {
  twinConfigFile: Option.Option<string>;
  workspaceRoot: Option.Option<string>;
  vscode: NativeTwinPluginConfiguration;
  initialized: boolean;
}

const make = Effect.gen(function* () {
  const Connection = yield* LSPConnectionService;
  const twin = yield* NativeTwinManagerService;
  const parser = yield* TwinRuntimeContext;
  const ref = yield* SubscriptionRef.make<VscodeLSPConfig>({
    workspaceRoot: Option.none(),
    twinConfigFile: Option.none(),
    initialized: false,
    vscode: DEFAULT_PLUGIN_CONFIG,
  });

  yield* parser.listenTwinConfigPath(ref.changes.pipe(Stream.filterMap((x) => x.twinConfigFile)));

  Connection.onDidChangeWatchedFiles(async (params) => {
    Connection.console.info(`WATCHER: ${JSON.stringify(params.changes)}`);
  });

  // Effect.addFinalizer(() => Effect.sync(() => watcher.dispose()));

  const updateConfig = (changes: any) =>
    Effect.gen(function* () {
      if (!Predicate.isRecord(changes)) return;
      const currentConfig = yield* SubscriptionRef.get(ref);
      const pluginConfig = currentConfig.vscode;

      if ('nativeTwin' in changes && changes['nativeTwin']) {
        Connection.console.debug('Configuration changes received: ');

        yield* SubscriptionRef.set(ref, {
          ...currentConfig,
          vscode: {
            ...pluginConfig,
            ...changes['nativeTwin'],
          },
        });
      }
    });

  Connection.onDidChangeConfiguration(async (changes) => {
    await Effect.runPromise(updateConfig(changes.settings));
  });

  Connection.onInitialize(async (params) => {
    const capabilities = getClientCapabilities(params.capabilities);

    const configOptions = params.initializationOptions;

    if (configOptions) {
      const twinConfigFile = Option.fromNullable<string>(configOptions?.twinConfigFile);
      const workspaceRoot = Option.fromNullable<string>(configOptions?.workspaceRoot);
      await Effect.runPromise(
        Effect.gen(function* () {
          const currentConfig = yield* SubscriptionRef.get(ref);
          yield* SubscriptionRef.set(ref, {
            ...currentConfig,
            twinConfigFile: twinConfigFile,
            workspaceRoot: workspaceRoot,
            initialized: Option.isSome(twinConfigFile),
          });
          if (Option.isSome(twinConfigFile)) {
            // yield* parser.loadTwinConfig(twinConfigFile.value);
            twin.loadUserFile(twinConfigFile.value);
          }
        }),
      );
    }

    return capabilities;
  });

  return {
    get: SubscriptionRef.get(ref),
    ref,
    changes: ref.changes,
  };
});

export class LSPConfigService extends Context.Tag('vscode/lsp/config')<
  LSPConfigService,
  Effect.Effect.Success<typeof make>
>() {
  static Live = Layer.scoped(
    LSPConfigService,
    make.pipe(Effect.tap(() => Effect.logDebug('[LAYERS] Initialized LSPConfig Layer'))),
  );
}
