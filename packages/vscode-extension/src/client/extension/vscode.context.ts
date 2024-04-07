import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Runtime from 'effect/Runtime';
import * as Scope from 'effect/Scope';
import * as vscode from 'vscode';
import { LanguageClientContext } from '../language/language.context';

export class ExtensionContext extends Ctx.Tag('vscode/ExtensionCtx')<
  ExtensionContext,
  vscode.ExtensionContext
>() {}

export const activateExtension = <E>(layer: Layer.Layer<never, E, ExtensionContext>) =>
  Effect.gen(function* (_) {
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
    .pipe(Effect.tap(Effect.log('asd')));

export const registerCommand = <R, E, A>(
  command: string,
  f: (...args: Array<any>) => Effect.Effect<A, E, R>,
) =>
  Effect.gen(function* (_) {
    const context = yield* _(ExtensionContext);
    const runtime = yield* _(Effect.runtime<R>());
    const run = Runtime.runFork(runtime);

    context.subscriptions.push(
      vscode.commands.registerCommand(command, (...args) =>
        f(...args).pipe(
          Effect.catchAllCause(Effect.log),
          Effect.annotateLogs({ command }),
          run,
        ),
      ),
    );
  });
