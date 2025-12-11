import * as vscode from 'vscode';
import {
  LSPConfig,
  LSPConstants,
  parseLSPConfigInput,
  type TwinConfigOptions,
} from '@native-twin/language-service/browser';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Scope from 'effect/Scope';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { VscodeContext } from './extension.service';
import { extensionConfigState, registerEditorCommand, thenable } from './extension.utils';

export const launchExtension = <E>(
  layer: Layer.Layer<never, E, VscodeContext | LSPConfig | Scope.Scope>,
) => {
  return Effect.gen(function* () {
    const context = yield* VscodeContext;
    const scope = yield* Scope.make();

    yield* registerEditorCommand(
      'compile.file',
      Effect.fn(function* (textEditor, _edit) {
        yield* Effect.log('URI: ', textEditor.document.uri);

        yield* Effect.void;
      }),
    );

    context.subscriptions.push({
      dispose: () => Effect.runFork(Scope.close(scope, Exit.void)),
    });

    const twinConfig = yield* extensionConfigState(LSPConstants.lspRawConfig);
    const currentConfig = yield* twinConfig.get;
    const files = yield* thenable(() =>
      vscode.workspace.findFiles('**/tailwind.config.{ts,js,mjs,cjs}', '**/node_modules/**', 1),
    );
    const tsConfigs = yield* thenable(() =>
      vscode.workspace.findFiles('**/tsconfig.json', '**/node_modules/**', 1),
    );

    const twinConfigPath = files[0]?.path;
    // console.log('BBB/TWIN_CONFIG_PATH', twinConfigPath);
    // const folders = asArray([...(vscode.workspace.workspaceFolders ?? [])]);
    // if (folders.length > 0) {
    //   const rootDir = folders[0];
    //   console.log('ROOT_DIR', rootDir);
    //   const files = yield* thenable(() => vscode.workspace.fs.readDirectory(rootDir.uri));
    //   twinConfigPath = vscode.Uri.joinPath(
    //     rootDir.uri,
    //     files.find((x) => x[0] === 'tailwind.config.js')?.[0] ?? twinConfigPath,
    //   ).toString(true);
    //   console.log('WORKSPACE_FILES', files);
    // }
    // console.log('TWIN_CONFIG_PATH', twinConfigPath);
    // console.log('STATE: ', context.workspaceState.keys());
    const rootDir =
      vscode.workspace.workspaceFolders?.[0]?.uri?.path ??
      vscode.Uri.joinPath(context.extensionUri).path;
    const tsConfigPath = tsConfigs[0]?.path;

    const configRef = yield* SubscriptionRef.make(
      parseLSPConfigInput({
        rootDir,
        debug: currentConfig.debug,
        enable: currentConfig.enable,
        functions: currentConfig.functions,
        jsxAttributes: currentConfig.jsxAttributes,
        twinConfigPath,
        tsConfigPath,
        completions: currentConfig.completions,
        diagnostics: currentConfig.diagnostics,
        trace: { server: currentConfig.trace.server },
      }),
    );
    const configSelector = <T>(selector: (config: TwinConfigOptions) => T) =>
      configRef.get.pipe(Effect.map((x) => selector(x)));

    const onChangeConfig = (config: any) => SubscriptionRef.set(configRef, config);

    const configLayer = Layer.succeed(
      LSPConfig,
      LSPConfig.of({
        config: configRef,
        onChangeConfig,
        configSelector,
        loadTwinConfig: (_filename) => {
          return Effect.promise(() =>
            import(_filename).then(Option.some).catch((error) => {
              console.log('ERROR: ', error);
              return Option.none();
            }),
          );
        },
      }),
    );
    const mainLayer = layer.pipe(Layer.provideMerge(configLayer));
    yield* Layer.buildWithScope(mainLayer, scope);
  }).pipe(Effect.catchAllCause((cause) => Effect.logFatal('FATAL: ', Cause.prettyErrors(cause))));
};
