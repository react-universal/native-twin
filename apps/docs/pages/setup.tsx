import { H1, P, View, Code, H3, H4 } from '@universal-labs/primitives';

const SetupPage = () => {
  return (
    <View className='flex-1'>
      <H1 className='text-gray-200'>Installation</H1>
      <P className='text-gray-200'>
        You have two options to use tailwindcss in you React Native project.
      </P>

      <H3 className='text-gray-200'>Option 1 (Recommended): Using primitives</H3>
      <P className='text-gray-200'>
        This option already gives you all React Native primitives pre-configured to use
        classNames or tw prop.
      </P>
      <H4 className='text-gray-200'>Steps:</H4>
      <Code className='rounded-lg bg-gray-900 p-2 text-gray-300'>
        yarn add @universal-labs/primitives
      </Code>
      <H3 className='text-gray-200'>Option 2 (Manual): Using styled HOC</H3>
      <P className='text-gray-200'>
        This options allows you to create your own primitives and styled any component.
      </P>
      <H4 className='text-gray-200'>Steps:</H4>
      <Code className='rounded-lg bg-gray-900 p-2 text-gray-300'>
        yarn add @universal-labs/styled
      </Code>
    </View>
  );
};

export default SetupPage;
