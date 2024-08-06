import { TextInput } from 'react-native';
import { useState } from 'react';

export const TextField = () => {
  const [text, setText] = useState('');
  return (
    <TextInput
      value={text}
      onChangeText={(data) => setText(data)}
      className='bg-pink-500 w-[20vw] h-20 focus:bg-white text(base black 5xl md:6xl)'
    />
  );
};
