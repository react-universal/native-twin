import { H1, View, Span } from '@react-universal/primitives';

const Index = () => {
  return (
    <View className='flex-1 items-center justify-center bg-gray-800 hover:bg-gray-500'>
      <H1 className='text-5xl'>Im an H1 Heading</H1>
      <H1 className='text-5xl'>Im an H1 Heading</H1>
      <Span className='text-9xl'>Span Text</Span>
    </View>
  );
};

export { Index };
