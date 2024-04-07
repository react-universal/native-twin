import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Scope from 'effect/Scope';
import * as vscode from 'vscode';

export class VSCodeContext extends Ctx.Tag('vscode/ExtensionCtx')<
  VSCodeContext,
  vscode.ExtensionContext
>() {}

export const activateExtension = <E>(layer: Layer.Layer<never, E, VSCodeContext>) =>
  Effect.gen(function* (_) {
    const context = yield* _(VSCodeContext);
    const scope = yield* _(Scope.make());
    context.subscriptions.push({
      dispose: () => Effect.runFork(Scope.close(scope, Exit.unit)),
    });
    yield* _(Layer.buildWithScope(layer, scope));
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Effect.tap(Effect.log('asd')));
