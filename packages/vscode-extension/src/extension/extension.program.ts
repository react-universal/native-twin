import * as vscode from 'vscode';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Scope from 'effect/Scope';
import { VscodeContext } from './extension.service.js';
import { registerEditorCommand } from './extension.utils.js';

export const launchExtension = <E>(layer: Layer.Layer<never, E, VscodeContext>) => {
  return Effect.gen(function* () {
    const context = yield* VscodeContext;
    // const docs = yield* LSPDocumentsService;
    const scope = yield* Scope.make();

    yield* registerEditorCommand('compile.file', (textEditor, edit) =>
      Effect.gen(function* () {
        edit.insert(new vscode.Position(0, 0), 'asdasdasd');
        yield* Effect.log(textEditor.document.uri);

        yield* Effect.void;
      }),
    );

    context.subscriptions.push({
      dispose: () => Effect.runFork(Scope.close(scope, Exit.void)),
    });

    yield* Layer.buildWithScope(layer, scope);
  }).pipe(Effect.catchAllCause(Effect.logFatal));
};
