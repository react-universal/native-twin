// import { Roboto } from '@next/font/google';
import install from '@twind/with-next/app';
import { tw } from '@universal-labs/twind-adapter';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/tw';

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
      <div style={{ flex: 1, backgroundColor: 'gray', display: 'flex' }}>
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default install(tw.config, MyApp);
