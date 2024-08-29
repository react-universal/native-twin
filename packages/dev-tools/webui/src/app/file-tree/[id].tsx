import { useSyncExternalStore } from 'react';
import { View } from 'react-native';
import JsonTreeSvgView from '@/features/json-tree/JsonTree';
import { componentsStore, unsafeGetTreeComponentByKey } from '@/features/app/store/components.store';
import { useGlobalSearchParams, useLocalSearchParams } from 'expo-router';

export default function TreeScreen() {
  const { order } = useGlobalSearchParams<{ order: string }>();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const node = useSyncExternalStore(
    componentsStore.subscribe,
    () => unsafeGetTreeComponentByKey(id),
    () => unsafeGetTreeComponentByKey(id),
  );
  console.log('BY_KET: ', node, { id, order });

  if (!node) return null;
  return <View className='flex-1'>{<JsonTreeSvgView node={node} />}</View>;
}
