import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as SubscriptionRef from 'effect/SubscriptionRef';
import { Connection, createConnection } from 'vscode-languageserver/node';
import * as ClientConfig from './client.config';

export class ConnectionService extends Context.Tag('connection/service')<
  ConnectionService,
  {
    Connection: Connection;
    ClientConfig: SubscriptionRef.SubscriptionRef<ClientConfig.ExtensionClientConfig>;
  }
>() {
  static Live = Layer.scoped(
    ConnectionService,
    Effect.gen(function* ($) {
      const connection = createConnection();
      const clientConfig = yield* $(ClientConfig.make);

      return {
        Connection: connection,
        ClientConfig: clientConfig,
      };
    }),
  );
}
