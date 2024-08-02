import { useEffect } from 'react';
import {
  useDevToolsPluginClient,
  type EventSubscription,
  setEnableLogging,
} from 'expo/devtools';

setEnableLogging(true);
export function useNativeTwinDevTools() {
  const client = useDevToolsPluginClient('@native-twin/dev-tools');

  useEffect(() => {
    const subscriptions: EventSubscription[] = [];

    subscriptions.push(
      client?.addMessageListener('ping', (data) => {
        console.log('DATA: ', data);
      }),
    );
    client?.sendMessage('ping', { from: 'app' });

    return () => {
      for (const subscription of subscriptions) {
        subscription?.remove();
      }
    };
  }, [client]);
}
