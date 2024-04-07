import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Runtime from 'effect/Runtime';
import * as vscode from 'vscode';
import { VSCodeContext } from './vscode.context';

export const thenable = <A>(f: () => Thenable<A>) =>
  Effect.async<A>((resume) => {
    f().then((_) => resume(Effect.succeed(_)));
  });

export const disposable = <A>(
  f: () => Thenable<A | undefined>,
): Effect.Effect<A, Cause.NoSuchElementException> =>
  thenable(f).pipe(Effect.flatMap(Effect.fromNullable));

export const executeCommand = (command: string, ...args: Array<any>) =>
  thenable(() => vscode.commands.executeCommand(command, ...args));

export const registerCommand = <R, E, A>(
  command: string,
  f: (...args: Array<any>) => Effect.Effect<A, E, R>,
) =>
  Effect.gen(function* (_) {
    const context = yield* _(VSCodeContext);
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

export const listen = <A, R>(
  event: vscode.Event<A>,
  f: (data: A) => Effect.Effect<void, never, R>,
): Effect.Effect<never, never, R> =>
  Effect.flatMap(Effect.runtime<R>(), (runtime) =>
    Effect.async<never>((_resume) => {
      const run = Runtime.runFork(runtime);
      const d = event((data) =>
        run(
          Effect.catchAllCause(f(data), (_) =>
            Effect.log('unhandled defect in event listener', _),
          ),
        ),
      );
      return Effect.sync(() => {
        d.dispose();
      });
    }),
  );

export const listenFork = <A, R>(
  event: vscode.Event<A>,
  f: (data: A) => Effect.Effect<void, never, R>,
) => Effect.forkScoped(listen(event, f));
