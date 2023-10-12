import { useState } from 'react';
import { defineConfig, setup } from '@universal-labs/native-twin';
import { presetTailwind } from '@universal-labs/preset-tailwind';
import styled from '@universal-labs/styled';

setup(
  defineConfig({
    presets: [presetTailwind()],
  }),
);

const CustomView = styled.View`flex-1`;

export const Main = () => {
  const [state, dispatch] = useState({
    backgroundColor: 'back',
  });
  return <CustomView className='bg-gray-200' style={state} />;
};
