import * as Effect from 'effect/Effect';
import * as Runtime from 'effect/Runtime';
import * as vscode from 'vscode';
import { thenable } from '../../shared/utils.shared';
import { ExtensionContext } from './extension.context';

export const executeCommand = (command: string, ...args: Array<any>) =>
  thenable(() => vscode.commands.executeCommand(command, ...args));

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
