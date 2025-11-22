import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { TwinRuntimeContext } from '../core/TwinRuntime.service.js';
import {
  DEFAULT_PLUGIN_CONFIG,
  type NativeTwinPluginConfiguration,
} from '../utils/constants.utils.js';

export interface VscodeLSPConfig {
  twinConfigFile: Option.Option<string>;
  workspaceRoot: Option.Option<string>;
  vscode: NativeTwinPluginConfiguration;
  initialized: boolean;
}

export interface VscodeLSPConfigInput {
  twinConfigFile?: string | undefined;
  workspaceRoot?: string | undefined;
  vscode: NativeTwinPluginConfiguration;
  initialized: boolean;
}

const make = Effect.gen(function* () {;
  const twinRuntime = yield* TwinRuntimeContext;

  const ref = yield* SubscriptionRef.make<VscodeLSPConfig>({
    workspaceRoot: Option.none(),
    twinConfigFile: Option.none(),
    initialized: false,
    vscode: DEFAULT_PLUGIN_CONFIG,
  });

  // Effect.addFinalizer(() => Effect.sync(() => watcher.dispose()));

  const onConfigConnectionChange = (changes: any) =>
    Effect.gen(function* () {
      if (!Predicate.isRecord(changes)) return;
      const currentConfig = yield* SubscriptionRef.get(ref);
      const pluginConfig = currentConfig.vscode;

      if ('nativeTwin' in changes && changes['nativeTwin']) {
        yield* Effect.logDebug('Configuration changes received: ');

        yield* SubscriptionRef.set(ref, {
          ...currentConfig,
          vscode: {
            ...pluginConfig,
            ...changes['nativeTwin'],
          },
        });
      }
    });

  const onUpdateConfig = (config: VscodeLSPConfigInput) =>
    Effect.gen(function* () {
      const twinConfigFile = Option.fromNullable(config.twinConfigFile);
      const workspaceRoot = Option.fromNullable(config.workspaceRoot);
      const currentConfig = yield* SubscriptionRef.get(ref);
      yield* SubscriptionRef.set(ref, {
        ...currentConfig,
        twinConfigFile: twinConfigFile,
        workspaceRoot: workspaceRoot,
        initialized: Option.isSome(twinConfigFile),
      });
      if (Option.isSome(twinConfigFile)) {
        // yield* parser.loadTwinConfig(twinConfigFile.value);
        // twin.loadUserFile(twinConfigFile.value);
        yield* twinRuntime.bootTwinRuntime(twinConfigFile.value);
      }
    });

  return {
    get: SubscriptionRef.get(ref),
    ref,
    changes: ref.changes,
    onUpdateConfig,
    onConfigConnectionChange,
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
