import styled from '@universal-labs/styled';

const H1 = styled.H1``;
const P = styled.P``;
const View = styled.View``;

const IndexPage = () => {
  return (
    <View className='items-center justify-center bg-white'>
      <View className='bg-slate-300 px-10 justify-center items-center py-5'>
        <H1 className='text-4xl font-bold'>Card title</H1>
        <View>
          <P className='text(2xl slate-800) font-medium'>Subtitle</P>
          <P className='text(lg slate-900) min-w-full'>
            dslkfjsdlkf jlksdjflk jsdlk fsdlkflsdkjlsdkjlkdsjsdlkflskdfl lkdsjflksdj lskd
            jlksdjf sdlklks djflksjfdslkjflsdkjflksdjflk jl sjdflkjsdlkf
          </P>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
