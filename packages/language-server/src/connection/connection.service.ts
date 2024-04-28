import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as ClientConfig from './client.config';
import * as Connection from './connection.resource';

export class ConnectionService extends Context.Tag('connection/service')<
  ConnectionService,
  {
    start: () => void;
    clientConfigRef: ClientConfig.ClientConfigResource;
    connectionRef: Connection.ConnectionResource;
  }
>() {
  static Live = Layer.scoped(
    ConnectionService,
    Effect.gen(function* ($) {
      const connectionRef = yield* $(Connection.make);
      const clientConfigRef = yield* $(ClientConfig.make);

      const connection = yield* $(connectionRef.get);

      return {
        start: () => {
          connection.listen();
        },
        connectionRef,
        clientConfigRef,
      };
    }),
  );
}
