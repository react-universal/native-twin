import { H1, P, View, H3 } from '@universal-labs/primitives';

const NextSetupPage = () => {
  return (
    <View className='flex-1'>
      <H1 className='my-3 text-3xl font-bold text-gray-200'>Next.js</H1>
      <P className='text-gray-200'>
        This lib can be used in a Next.js project that is already configured to use Expo or
        vanilla React Native Web, the configuration will be the same as being using react
        native web for nextjs or just nextjs without react native.
      </P>
      <P className='text-gray-200'>
        We dont use any babel plugin or swc special config so there is nothing more to do.
      </P>
      <H3 className='my-2 text-xl font-bold text-gray-200'>Setup tailwind CSS</H3>

      <P className='text-gray-200'>
        Simply configure Next.js as tailwindcss docs shows{' '}
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
