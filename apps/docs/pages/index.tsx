import { H1, P, View, UL, LI, H2, H3, Strong } from '@universal-labs/primitives';

const IndexPage = () => {
  return (
    <View className='flex-1'>
      <H1 className='text-gray-200'>React Native Tailwindcss</H1>
      <H2 className='text-gray-300'>What is it?</H2>
      <P className='text-gray-300'>
        React Universal simplifies the integration of Tailwind CSS framework in React Native
        hybrid apps. Our main goal is to bridge the gap for React web developers in need to
        write universal components for native and web. This package allows developers to write
        Tailwind CSS classes with all states <Strong>(:active, :hover, :focus)</Strong> that
        just works and looks as expected in native.
      </P>
      <P className='text-gray-300'>Forget looking , and focus on creating wonderful apps.</P>
      <H3 className='text-gray-300'>Features:</H3>
      <UL>
        <LI className='font-bold text-gray-400'>- 🍃 Uses Tailwind CSS framework</LI>
        <LI className='font-bold text-gray-400'>
          - 🌎 Universal Design: Write Tailwind ClassNames and they just work in web and native
        </LI>
        <LI className='font-bold text-gray-400'>- ⚡ Vite: Enjoy speed building</LI>
        <LI className='font-bold text-gray-400'>- 🔥 No Babel dependencies</LI>
        <LI className='font-bold text-gray-400'>- 🔏 Typescript by default</LI>
        <LI className='font-bold text-gray-400'>- 🎨 CSS in TS: Typed CSS</LI>
        <LI className='font-bold text-gray-400'>
          - 💅 Parent State: _hover / active / focus_ fully compatible between web and native
        </LI>
        <LI className='font-bold text-gray-400'>
          - 👪 Family styles: Parent component styles affecting children as expected.
        </LI>
        <LI className='font-bold text-gray-400'>
          - 🤏 Lightweight: We parse only the classnames used in your project. No junk.
        </LI>
      </UL>
    </View>
  );
};

export default IndexPage;
