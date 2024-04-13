import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as LogLevel from 'effect/LogLevel';
import * as Logger from 'effect/Logger';
import * as Scope from 'effect/Scope';
import * as vscode from 'vscode';
import { LanguageClientContext } from '../language/language.context';

export class ExtensionContext extends Ctx.Tag('vscode/ExtensionCtx')<
  ExtensionContext,
  vscode.ExtensionContext
>() {}

export const activateExtension = <E>(layer: Layer.Layer<never, E, ExtensionContext>) => {
  return Effect.gen(function* (_) {
    const context = yield* _(ExtensionContext);
    const languageServer = yield* _(LanguageClientContext);
    languageServer.start();
    const scope = yield* _(Scope.make());
    context.subscriptions.push({
      dispose: () => Effect.runFork(Scope.close(scope, Exit.unit)),
    });
    yield* _(Layer.buildWithScope(layer, scope));
  })
    .pipe(Effect.catchAllCause(Effect.logFatal))
    .pipe(Logger.withMinimumLogLevel(LogLevel.All));
};
