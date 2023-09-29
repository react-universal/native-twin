import React from 'react';
import { installDocument } from '@universal-labs/native-tailwind-nextjs/document';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  // @ts-expect-error
  render() {
    const currentLocale = this.props.__NEXT_DATA__.locale || 'en';
    return (
      <Html lang={currentLocale}>
        <Head>
          <meta charSet='UTF-8' />
          <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        </Head>
        <body className='min-h-screen min-w-full'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default installDocument(MyDocument);
