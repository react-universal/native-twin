// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';

const ChildProp = () => {
  return (
    <View className='bg-black last:text-lg'>
      <Text className='text-blue'>Text1</Text>
      <Text className='text-red'>Text2</Text>
    </View>
  );
};

export { ChildProp };
