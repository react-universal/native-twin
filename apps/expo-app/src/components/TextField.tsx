import { useState } from 'react';
import { TextInput, View } from 'react-native';

export const TextField = () => {
  const [text, setText] = useState('');
  return (
    <View>
      <TextInput
        value={text}
        onChangeText={(data) => setText(data)}
        className='bg-pink-500 w-[20vw] h-20 focus:bg-white text(base black 5xl md:6xl)'
      />
    </View>
  );
};
