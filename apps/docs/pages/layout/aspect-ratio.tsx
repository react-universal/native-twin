import { H1, H2, P, View } from '@universal-labs/primitives';
import { CompatibilityTable } from '../../lib/components/CompatibilityTable';

const defaultData = [
  {
    class: 'aspect-auto',
    native: '✅',
    web: '✅',
  },
  {
    class: 'aspect-video',
    native: '✅',
    web: '✅',
  },
  {
    class: 'aspect-square',
    native: '✅',
    web: '✅',
  },
];

const AspectRatioPage = () => {
  return (
    <View className='flex-1 bg-transparent'>
      <H1 className='text-3xl font-bold text-gray-300'>Aspect Ratio</H1>
      <P className='my-3 text-lg text-gray-300'>
        Please refer to the{' '}
        <a
          href='https://tailwindcss.com/docs/aspect-ratio'
          target='_blank'
          className='text-blue-500'
        >
          documentation on the Tailwind CSS website
        </a>
      </P>
      <H2 className='my-2 text-2xl font-bold text-gray-300'>Compatibility</H2>
      <CompatibilityTable data={defaultData} />
    </View>
  );
};

export default AspectRatioPage;
