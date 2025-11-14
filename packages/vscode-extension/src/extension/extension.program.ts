import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Scope from 'effect/Scope';
import { VscodeContext } from './extension.service';
import { registerEditorCommand } from './extension.utils';

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

    yield* Layer.buildWithScope(layer, scope);
  }).pipe(Effect.catchAllCause((cause) => Effect.logFatal('FATAL: ', Cause.prettyErrors(cause))));
};
