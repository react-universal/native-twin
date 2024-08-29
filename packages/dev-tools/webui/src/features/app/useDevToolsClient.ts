import { useEffect } from 'react';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import {
  useDevToolsPluginClient,
  DevToolsPluginClient,
  type EventSubscription,
} from 'expo/devtools';

type EventSubscriptionFn<T> = (client: DevToolsPluginClient, data: T) => void;

export const useDevToolsClient = () => {
  const clientI = useDevToolsPluginClient('@native-twin/dev-tools');

  return Option.fromNullable(clientI);
};

export const useClientSubscription = <T>(event: string, cb: EventSubscriptionFn<T>) => {
  const client = useDevToolsClient();

  useEffect(() => {
    const subscriptions: Option.Option<EventSubscription>[] = [];

    subscriptions.push(
      pipe(
        client,
        Option.map((pluginClient) =>
          pluginClient.addMessageListener(event, (data) => cb(pluginClient, data)),
        ),
      ),
    );
    return () => {
      pipe(
        subscriptions,
        RA.getSomes,
        RA.forEach((x) => x?.remove()),
      );
    };
  }, [event, cb, client]);
};
