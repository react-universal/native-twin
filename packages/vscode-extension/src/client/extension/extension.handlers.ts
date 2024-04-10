import { Logger, LogLevel } from 'effect';
import * as Effect from 'effect/Effect';
import * as Exit from 'effect/Exit';
import * as Layer from 'effect/Layer';
import * as Runtime from 'effect/Runtime';
import * as Scope from 'effect/Scope';
import * as vscode from 'vscode';
import { thenable } from '../../shared/utils.shared';
import { LanguageClientContext } from '../language/language.context';
import { ExtensionContext } from './extension.context';

export const executeCommand = (command: string, ...args: Array<any>) =>
  thenable(() => vscode.commands.executeCommand(command, ...args));

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

export const registerCommand = <R, E, A>(
  command: string,
  f: (...args: Array<any>) => Effect.Effect<A, E, R>,
) => {
  return Effect.gen(function* (_) {
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
};
