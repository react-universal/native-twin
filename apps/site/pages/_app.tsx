import { Roboto } from '@next/font/google';
import install from '@twind/with-next/app';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import tailwind from '../styles/tw';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-roboto',
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Show case</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
      </Head>
      <div className={`${roboto.variable} font-roboto flex flex-1 bg-gray-700`}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default install(tailwind.instance.tw.config, MyApp);
