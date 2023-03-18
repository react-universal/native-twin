import { FlatList, Span, View } from '@universal-labs/primitives';

const data = [
  {
    id: 'aasd',
    label: 'label',
  },
];

const FlatListScreen = () => {
  return (
    <View className='flex-1 bg-white'>
      <FlatList
        data={data}
        contentContainerStyle='flex-1 items-center justify-center'
        renderItem={({ item }) => {
          return (
            <View>
              <Span>{item.label}</Span>
            </View>
          );
        }}
      />
    </View>
  );
};

export { FlatListScreen };
