import { useState } from 'react';
import { defineConfig, setup } from '@universal-labs/native-twin';
import { presetTailwind } from '@universal-labs/preset-tailwind';
import { View } from '@universal-labs/styled';

setup(
  defineConfig({
    presets: [presetTailwind()],
  }),
);

export const Main = () => {
  const [state, dispatch] = useState({
    backgroundColor: 'back',
  });
  return <View className='flex-1 bg-gray-200' style={state} />;
};
