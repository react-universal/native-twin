// import { Roboto } from '@next/font/google';
import { installApp } from '@universal-labs/native-tailwind-nextjs/_app';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import twConfig from '../tailwind.config';

// const roboto = Roboto({
//   subsets: ['latin'],
//   weight: ['400', '700', '900'],
//   variable: '--font-roboto',
// });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Show case</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <div className='flex-1 bg-gray-200 flex'>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default installApp(twConfig, MyApp);
