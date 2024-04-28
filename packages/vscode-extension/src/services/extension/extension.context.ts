import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Scope from 'effect/Scope';
import * as vscode from 'vscode';

export class ExtensionContext extends Ctx.Tag('vscode/ExtensionCtx')<
  ExtensionContext,
  vscode.ExtensionContext
>() {}

export const activateExtension = <E>(layer: Layer.Layer<never, E, ExtensionContext>) => {
  return Effect.gen(function* ($) {
    const context = yield* $(ExtensionContext);
    const scope = yield* $(Scope.make());

    context.subscriptions.push({
      dispose: () => Effect.runFork(Scope.close(scope, Exit.void)),
    });

    yield* $(Layer.buildWithScope(layer, scope));
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
