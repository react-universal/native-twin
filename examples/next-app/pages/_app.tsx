// import { Roboto } from '@next/font/google';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/globals.css';
import '../styles/tw';

// const roboto = Roboto({
//   subsets: ['latin'],
//   weight: ['400', '700', '900'],
//   variable: '--font-roboto',
// });

export default function MyApp({ Component, pageProps }: AppProps) {
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

// export default install(tw.config, MyApp);
