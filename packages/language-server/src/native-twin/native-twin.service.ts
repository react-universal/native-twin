import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Option from 'effect/Option';
import * as Ref from 'effect/Ref';
import { ExtensionClientConfig } from '../connection/client.config';
import { ConnectionService } from '../connection/connection.service';
import * as NativeTwinResource from './native-twin.resource';
import { TwinStore, createTwinStore } from './native-twin.utils';

export class NativeTwinService extends Context.Tag('plugin/IntellisenseService')<
  NativeTwinService,
  {
    store: Ref.Ref<TwinStore>;
    nativeTwin: NativeTwinResource.NativeTwinHandlerResource;
    onUpdateConfig: (x: ExtensionClientConfig) => void;
  }
>() {}

export const NativeTwinServiceLive = Layer.scoped(
  NativeTwinService,
  Effect.gen(function* ($) {
    const { clientConfigRef } = yield* $(ConnectionService);
    const twin = yield* $(NativeTwinResource.make);
    const nativeTwinHandler = yield* $(twin.get);
    const twinStore: Ref.Ref<TwinStore> = yield* $(
      Ref.make(createTwinStore(nativeTwinHandler)),
    );
    // const maybeTwin = yield* $(Ref.make(Option.none<TwinStore>()));

    const updateClientConfig = () => {
      const clientConfig = clientConfigRef.get.pipe(Effect.runSync);
      const newTwin = Ref.setAndGet(
        twin.clientConfig,
        NativeTwinResource.createTwin(
          clientConfig.twinConfigFile.pipe(
            Option.map((x) => x.path),
            Option.getOrUndefined,
          ),
        ),
      ).pipe(Effect.runSync);

      Ref.setAndGet(twinStore, createTwinStore(newTwin)).pipe(Effect.runSync);
    };

    return {
      store: twinStore,
      nativeTwin: twin,
      onUpdateConfig() {
        updateClientConfig();
      },
    };
  }),
);
