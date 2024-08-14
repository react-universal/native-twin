import { useEffect } from 'react';
import { useDevToolsPluginClient, setEnableLogging } from 'expo/devtools';

setEnableLogging(true);
export function useNativeTwinDevTools(tree?: any) {
  const client = useDevToolsPluginClient('@native-twin/dev-tools');

  useEffect(() => {
    if (tree) {
      client?.sendMessage('tree', tree);
    }
  }, [client, tree]);
}
