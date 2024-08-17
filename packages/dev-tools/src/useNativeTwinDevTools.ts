import * as Option from 'effect/Option';
import type { RawJSXElementTreeNode } from '@native-twin/css/jsx';
import { PLUGIN_EVENTS } from './constants/event.constants';
import { useDevToolsClient } from './hooks/useDevToolsClient';
import { useEventEmitter } from './hooks/useEventEmitter';

export function useNativeTwinDevTools() {
  const client = useDevToolsClient();
  const { addListener } = useEventEmitter();

  return {
    registerTree: (tree: RawJSXElementTreeNode) => {
      Option.map(client, (pluginClient) =>
        pluginClient.sendMessage(PLUGIN_EVENTS.receiveTree, tree),
      );
    },
    addListener,
  };
}
