import { TextInput } from 'react-native-gesture-handler';
import { useState } from 'react';

export const TextField = () => {
  const [text, setText] = useState('');
  return (
    <TextInput
      value={text}
      onChangeText={(data) => setText(data)}
      className='bg-pink-400 focus:bg-white text(base black 5xl md:6xl)'
    />
  );
};
