import * as vscode from 'vscode';
import { Constants, withRuntimeConfig } from '@native-twin/language-service';
import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Scope from 'effect/Scope';
import { VscodeContext } from './extension.service';
import { extensionConfigState, registerEditorCommand, thenable } from './extension.utils';

export const launchExtension = <E>(layer: Layer.Layer<never, E, VscodeContext>) => {
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

    const twinConfig = yield* extensionConfigState(Constants.DEFAULT_PLUGIN_CONFIG);
    const currentConfig = yield* twinConfig.get;
    const files = yield* thenable(() =>
      vscode.workspace.findFiles(
        '**/{tailwind,twin,nativeTwin,native-twin}.config.{ts,js,mjs,cjs}',
        '**/node_modules/**',
        1,
      ),
    );

    const twinFilePath = files[0]?.path;
    const rootDir = vscode.workspace.workspaceFolders?.[0]?.uri?.path ?? process.cwd();

    const mainLayer = layer.pipe(
      Layer.provide(
        withRuntimeConfig({
          debug: currentConfig.debug,
          enable: currentConfig.enable,
          functions: currentConfig.functions,
          jsxAttributes: currentConfig.jsxAttributes,
          rootDir,
          twinConfigPath: twinFilePath,
          trace: currentConfig.trace.server,
        }),
      ),
    );
    yield* Layer.buildWithScope(mainLayer, scope);
  }).pipe(Effect.catchAllCause((cause) => Effect.logFatal('FATAL: ', Cause.prettyErrors(cause))));
};
