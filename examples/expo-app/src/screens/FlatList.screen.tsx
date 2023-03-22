import { useCallback, useState } from 'react';
import { ListRenderItem, SafeAreaView } from 'react-native';
import { H2, Pressable, Span, View, FlatList } from '@universal-labs/primitives';

const data = [
  {
    id: 0,
    label: 'label',
  },
];

const FlatListScreen = () => {
  const [items, setItems] = useState(data);

  const addItem = useCallback(() => {
    setItems((prevState) => [
      ...prevState,
      {
        id: prevState.length,
        label: `Item - ${prevState.length}`,
      },
    ]);
  }, []);
  const renderItem: ListRenderItem<(typeof items)[number]> = ({ item }) => {
    return (
      <View>
        <Span>{item.label}</Span>
      </View>
    );
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className='flex-1'>
        <Pressable onPress={addItem} className='bg-gray-400 '>
          <H2>Add item</H2>
        </Pressable>
        <FlatList
          data={items}
          contentContainerStyle='bg-gray-600 hover:bg-white'
          // @ts-expect-error
          renderItem={renderItem}
        />
      </View>
    </SafeAreaView>
  );
};

export { FlatListScreen };
