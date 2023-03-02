import { H1, View } from '@react-universal/primitives';
import { Button } from '@react-universal/tailwind-ui';

const IndexPage = () => {
  return (
    <View className='flex-1 items-center justify-center bg-gray-800'>
      <H1 className='text-gray-200 hover:text-green-500'>sad</H1>
      <Button className='focus:bg-slate-200'>
        <H1>sad</H1>
      </Button>
    </View>
  );
};

export default IndexPage;
