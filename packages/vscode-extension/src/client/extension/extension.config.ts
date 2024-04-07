import * as Effect from 'effect/Effect';
import * as Option from 'effect/Option';
import * as Scope from 'effect/Scope';
import * as Stream from 'effect/Stream';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import * as vscode from 'vscode';
import { listenFork } from './extension.handlers';

export interface ConfigRef<A> {
  readonly get: Effect.Effect<A>;
  readonly changes: Stream.Stream<A>;
}

export const extensionConfig = <A>(
  namespace: string,
  setting: string,
): Effect.Effect<ConfigRef<Option.Option<A>>, never, Scope.Scope> =>
  Effect.gen(function* (_) {
    const get = () => vscode.workspace.getConfiguration(namespace).get<A>(setting);
    const ref = yield* _(SubscriptionRef.make<Option.Option<A>>(Option.fromNullable(get())));
    yield* _(
      listenFork(vscode.workspace.onDidChangeConfiguration, (_) =>
        SubscriptionRef.set(ref, Option.fromNullable(get())),
      ),
    );
    return {
      get: SubscriptionRef.get(ref),
      changes: Stream.changes(ref.changes),
    };
  });

export const extensionConfigValue = <A>(
  namespace: string,
  key: string,
  defaultValue: A,
): Effect.Effect<ConfigRef<A>, never, Scope.Scope> =>
  Effect.gen(function* (_) {
    const get = () => vscode.workspace.getConfiguration(namespace).get<A>(key);
    const ref = yield* _(SubscriptionRef.make(get() ?? defaultValue));

    yield* _(
      listenFork(vscode.workspace.onDidChangeConfiguration, (_) =>
        SubscriptionRef.set(ref, get() ?? defaultValue),
      ),
    );

    return {
      get: SubscriptionRef.get(ref),
      changes: Stream.changes(ref.changes),
    };
  });
