// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';

const ChildProp = () => {
  return (
    <View className='bg-black last:text-lg odd:text-gray-200 even:text-yellow-200'>
      <Text className='font-medium'>Text1</Text>
      <Text className='font-bold'>Text2</Text>
      <Text className='font-medium'>Text3</Text>
    </View>
  );
};

export { ChildProp };
