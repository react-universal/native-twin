import * as Option from 'effect/Option';
import type { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { PLUGIN_EVENTS } from './constants/event.constants';
import { useDevToolsClient } from './hooks/useDevToolsClient';

export function useNativeTwinDevTools() {
  const client = useDevToolsClient();

  return {
    registerTree: (tree: RawJSXElementTreeNode) => {
      Option.tap(client, (data) => {
        console.log('DATA: ', data);
        return Option.some(data);
      });
      Option.map(client, (pluginClient) =>
        pluginClient.sendMessage(PLUGIN_EVENTS.receiveTree, tree),
      );
    },
  };
}
