import * as Cause from 'effect/Cause';
import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Runtime from 'effect/Runtime';
import * as Scope from 'effect/Scope';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import * as vscode from 'vscode';
import { ExtensionContext } from './extension.service';

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
  event: vscode.Event<A>,
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
  event: vscode.Event<A>,
  f: (data: A) => Effect.Effect<void, never, R>,
) => Effect.forkScoped(listenDisposableEvent(event, f));

export interface ConfigRef<A> {
  readonly get: Effect.Effect<A>;
  readonly changes: Stream.Stream<A>;
}

/**
 *
 * @description Subscribe to a section value for the plugin using its namespace
 * the default namespace its `nativeTwin`
 */
export const extensionConfig = <A>(
  namespace: string,
  setting: string,
): Effect.Effect<ConfigRef<Option.Option<A>>, never, Scope.Scope> =>
  Effect.gen(function* (_) {
    const get = () => vscode.workspace.getConfiguration(namespace).get<A>(setting);
    const ref = yield* _(SubscriptionRef.make<Option.Option<A>>(Option.fromNullable(get())));
    yield* _(
      listenForkEvent(vscode.workspace.onDidChangeConfiguration, (_) =>
        SubscriptionRef.set(ref, Option.fromNullable(get())),
      ),
    );

    return {
      get: SubscriptionRef.get(ref),
      changes: Stream.changes(ref.changes),
    };
  });

/**
 *
 * @description Subscribe to a section value for the plugin using its namespace
 * the default namespace its `nativeTwin` \n
 * The main difference with extensionConfig its you need to provide a default value
 */
export const extensionConfigValue = <A>(
  namespace: string,
  key: string,
  defaultValue: A,
): Effect.Effect<ConfigRef<A>, never, Scope.Scope> =>
  Effect.gen(function* (_) {
    const get = () => vscode.workspace.getConfiguration(namespace).get<A>(key);
    const ref = yield* _(SubscriptionRef.make(get() ?? defaultValue));

    yield* _(
      listenForkEvent(vscode.workspace.onDidChangeConfiguration, (_) =>
        SubscriptionRef.set(ref, get() ?? defaultValue),
      ),
    );

    return {
      get: SubscriptionRef.get(ref),
      changes: Stream.changes(ref.changes),
    };
  });
