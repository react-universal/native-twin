import React from 'react';
import install from '@twind/with-next/document';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
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

export default install(MyDocument);
