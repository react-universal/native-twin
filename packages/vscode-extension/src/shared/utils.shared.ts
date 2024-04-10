import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Runtime from 'effect/Runtime';
import type { Event } from 'vscode';

export const thenable = <A>(f: () => Thenable<A>) => {
  return Effect.async<A>((resume) => {
    f().then((_) => resume(Effect.succeed(_)));
  });
};

export const disposable = <A>(
  f: () => Thenable<A | undefined>,
): Effect.Effect<A, Cause.NoSuchElementException> => {
  return thenable(f).pipe(Effect.flatMap(Effect.fromNullable));
};

export const listenDisposableEvent = <A, R>(
  event: Event<A>,
  f: (data: A) => Effect.Effect<void, never, R>,
): Effect.Effect<never, never, R> => {
  return Effect.flatMap(Effect.runtime<R>(), (runtime) =>
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
};

export const listenForkEvent = <A, R>(
  event: Event<A>,
  f: (data: A) => Effect.Effect<void, never, R>,
) => Effect.forkScoped(listenDisposableEvent(event, f));
