import { H1, View } from '@react-universal/primitives';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { ButtonsSample } from '../lib/components/ButtonsSample';

const IndexPage = () => {
  return (
    <View className='flex-1'>
      <H1>What is react universal?</H1>
      <ButtonsSample />
      <SyntaxHighlighter
        language='react'
        style={darcula}
        showLineNumbers
        wrapLines
        useInlineStyles
      >
        {`<View className='flex-1'>
          <H1>sad</H1>
        </View>`}
      </SyntaxHighlighter>
    </View>
  );
};

export default IndexPage;
