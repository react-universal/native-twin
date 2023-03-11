import { H1, View } from '@universal-labs/primitives';
import { Button } from '@universal-labs/tailwind-ui';

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
