import { useSyncExternalStore } from 'react';
import { Text, View } from 'react-native';
import { PLUGIN_EVENTS } from '@/constants/event.constants';
import { useClientSubscription } from '@/hooks/useDevToolsClient';
import { componentsStore, setTreeComponent } from '@/store/components.store';
import * as RA from 'effect/Array';
import { pipe } from 'effect/Function';
import * as MutableHashMap from 'effect/MutableHashMap';
import { Link } from 'expo-router';
import { RawJSXElementTreeNode } from '@native-twin/css/build/jsx';

export default function TreeScreen() {
  useSyncExternalStore(
    componentsStore.subscribe,
    () => MutableHashMap.size(componentsStore.getState()),
    () => MutableHashMap.size(componentsStore.getState()),
  );
  useClientSubscription<RawJSXElementTreeNode>(PLUGIN_EVENTS.receiveTree, (_, tree) => {
    console.log('TREE_RECEIVED');
    setTreeComponent(tree);
  });
  console.log('components', componentsStore.getState());
  return (
    <View className='flex-1'>
      {pipe(
        componentsStore.getState(),
        RA.fromIterable,
        RA.map((x) => (
          <Link
            key={`${x[0].id}`}
            href={{
              pathname: `/file-tree/${x[1].id}`,
              params: {
                id: x[1].id,
                order: x[1].order,
              },
            }}
          >
            <Text>{`${x[0].id}`}</Text>
          </Link>
        )),
      )}
    </View>
  );
}
