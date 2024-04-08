import * as Ctx from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Runtime from 'effect/Runtime';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import {
  Connection,
  createConnection,
  ProposedFeatures,
  Event,
} from 'vscode-languageserver/node';
import { ServerConfigState } from './connection.configs';
import { setConfigCapabilities } from './connection.effects';

export class ConnectionContext extends Ctx.Tag('ConnectionContext')<
  ConnectionContext,
  {
    readonly connection: Connection;
    readonly configState: SubscriptionRef.SubscriptionRef<ServerConfigState>;
  }
>() {
  static readonly Live = Layer.scoped(
    ConnectionContext,
    Effect.gen(function* (_) {
      const connection = createConnection(ProposedFeatures.all);
      const configState = yield* _(
        SubscriptionRef.make(
          new ServerConfigState({
            hasConfigurationCapability: false,
            hasDiagnosticRelatedInformationCapability: false,
            hasWorkspaceFolderCapability: false,
          }),
        ),
      );

      yield* _(
        listenFork(connection.onInitialize, (initialParams) => {
          return SubscriptionRef.update(configState, (x) => {
            connection.console.debug(`INITIAL_PARAMS: ${initialParams}`);
            return x.setConfig(x.setConfig(setConfigCapabilities(initialParams.capabilities)));
          });
        }),
      );

      return { connection, configState };
    }),
  );
}

export const listen = <A, R>(
  event: Event<A>,
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
  event: Event<A>,
  f: (data: A) => Effect.Effect<void, never, R>,
) => Effect.forkScoped(listen(event, f));
