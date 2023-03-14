import { H1, P, View, Code, H3, Span } from '@universal-labs/primitives';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const NativeSetupPage = () => {
  return (
    <View className='flex-1'>
      <H1 className='my-3 text-3xl font-bold text-gray-200'>Expo / React Native CLI</H1>
      <H3 className='my-2 text-xl font-bold text-gray-200'>1. Create the project</H3>
      <Code className='my-2 rounded-lg bg-gray-900 p-2 text-gray-300'>
        npx create-expo-app my-app
        <br />
        <br />
        cd my-app
      </Code>

      <P className='text-gray-200'>
        You will need to install @universal-labs/primitives and it's peer dependency
        tailwindcss.
      </P>
      <Code className='my-2 rounded-lg bg-gray-900 p-2 text-gray-300'>
        yarn add @universal-labs/primitives
        <br />
        yarn add -D tailwindcss
      </Code>

      <H3 className='my-3 text-xl font-bold text-gray-200'>2. Setup Tailwind CSS</H3>
      <P className='leading-6 text-gray-200'>
        Run <Code className='rounded-md bg-gray-900 px-2 py-1'>npx tailwindcss init</Code> to
        create a <Code className='rounded-md bg-gray-900 px-2 py-1'>tailwind.config.js</Code>{' '}
        file Add the paths to all of your component files in your tailwind.config.js file.
        Remember to replace{' '}
        <Code className='rounded-md bg-gray-900 px-2 py-1'>{'<custom directory>'}</Code> with
        the actual name of your directory e.g.{' '}
        <Code className='rounded-md bg-gray-900 px-2 py-1'>screens</Code>.
      </P>

      <H3 className='my-3 text-xl font-bold text-gray-200'>3. Thats it! 🎊</H3>
      <Span className='text-gray-200'>Start using tailwindcss!</Span>
      <SyntaxHighlighter
        language='react'
        showLineNumbers
        showInlineLineNumbers
        useInlineStyles
        style={darcula}
      >{`<View>asd</View>`}</SyntaxHighlighter>
    </View>
  );
};

export default NativeSetupPage;
