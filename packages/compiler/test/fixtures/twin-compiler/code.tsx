// @ts-noCheck
import { useState } from 'react';
import { Text, View } from 'react-native';
import 'globals.css';

const Button = () => {
  return (
    <View className='bg-[#000] last:hover:text-[20vw] hover:bg-red odd:text-[10px] even:text-[30px]'>
      <Text className='font-medium'>Text1</Text>
      <Text className={`${true ? 'text-medium' : 'text-bold'}`}>Text3</Text>
      <View>
        <Span>Hallo</Span>
      </View>
    </View>
  );
};

const AnyOther = () => (
  <View className='flex-1'>
    <Text className='flex-1'>asd</Text>
  </View>
)

export { ChildProp };
