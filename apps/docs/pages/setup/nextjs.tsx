import { H1, P, View, H3 } from '@universal-labs/primitives';

const NextSetupPage = () => {
  return (
    <View className='flex-1'>
      <H1 className='text-gray-200'>Next.js</H1>
      <P className='text-gray-200'>
        This lib can be used in a Next.js project that is already configured to use Expo or
        vanilla React Native Web, the configuration will be the same as being using react
        native web for nextjs.
      </P>
      <H3 className='text-gray-200'>1. Setup tailwind CSS</H3>

      <P className='text-gray-200'>
        Simply configure Next.js as per{' '}
        <a
          className='text-blue-400'
          href='https://tailwindcss.com/docs/guides/nextjs'
          target='_blank'
        >
          the Tailwind CSS Next.js setup guide
        </a>
      </P>
    </View>
  );
};

export default NextSetupPage;
