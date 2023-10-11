import styled from '@universal-labs/styled';

// import { GetServerSidePropsResult } from 'next';

const H1 = styled.H1``;
const P = styled.P``;
const View = styled.View``;

// export function getServerSideProps(): GetServerSidePropsResult<any> {
//   return { props: { asd: 1 } };
// }

const IndexPage = () => {
  return (
    <View className='items-center justify-center bg-gray-900 flex-1'>
      <View className='bg-slate-300 px-8 justify-center ios:items-center py-5 rounded-xl group'>
        <H1 className='text(4xl group-hover:(blue-200) sm:5xl) font-bold -translate-1 scale-100 first-letter:mx-10'>
          Card title
        </H1>
        <View>
          <P className='text(2xl gray-100) hover:font-bold'>Subtitle</P>
          <P className='text(lg) text-red-500 min-w-full'>Card description</P>
        </View>
      </View>
    </View>
  );
};

export default IndexPage;
