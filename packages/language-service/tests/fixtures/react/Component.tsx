import { useState } from 'react';
import { Text, View } from './Primitives';

export const App = () => {
  const [state, _] = useState('bg-red-500');
  return (
    <View className='bg-gray shadow-md'>
      <Text className={'bg-rose-700 bg-blue bg-black text(sm md:gray)'} />
      <View className={`bg-raw`}>
        <Text className={`bg-raw2222 ${state} raw-3333`} />
        <Text className={'bg-red-500 asdasdasd'} />
      </View>
    </View>
  );
};
