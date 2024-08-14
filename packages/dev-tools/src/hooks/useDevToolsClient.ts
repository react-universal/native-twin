import { useEffect } from 'react';
import { pipe } from 'effect/Function';
import * as Option from 'effect/Option';
import { useDevToolsPluginClient, type EventSubscription } from 'expo/devtools';

type EventSubscriptionFn = <T>(data: T) => void;

export const useDevToolsClient = () => {
  const clientI = useDevToolsPluginClient('@native-twin/dev-tools');

  return Option.fromNullable(clientI);
};

export const useClientSubscription = (event: string, cb: EventSubscriptionFn) => {
  const client = useDevToolsClient();

  useEffect(() => {
    const sb: Option.Option<EventSubscription> = pipe(
      client,
      Option.map((x) => x.addMessageListener(event, cb)),
    );
    return () => {
      Option.map(sb, (x) => x.remove());
    };
  }, [event, cb, client]);
};
