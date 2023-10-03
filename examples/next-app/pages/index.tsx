import styled from '@universal-labs/styled';

const H1 = styled.H1``;
const P = styled.P``;
const View = styled.View``;

const IndexPage = () => {
  return (
    <View className='items-center justify-center bg-white flex-1'>
      <View className='bg-slate-300 px-10 justify-center items-center py-5 rounded-xl'>
        <H1 className='text(4xl hover:(blue-200) md:2xl) font-bold'>Card title</H1>
        <View>
          <P className='text(2xl gray-100) font-medium'>Subtitle</P>
          <P className='text(lg) text-red-500 min-w-full'>Card description</P>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
