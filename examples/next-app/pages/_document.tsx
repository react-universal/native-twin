import React from 'react';
import { AppRegistry } from 'react-native';
import { initialize, extract } from '@universal-labs/twind-adapter';
import Document, { Html, Head, Main, NextScript } from 'next/document';

const { tw } = initialize();

export async function getInitialProps({ renderPage }) {
  AppRegistry.registerComponent('Main', () => Main);
  const page = await renderPage();
  const page2 = extract(page.html, tw);
  const styles = [<style key='style-reset' dangerouslySetInnerHTML={{ __html: page2.css }} />];
  return { ...page, styles: React.Children.toArray(styles) };
}

export default class MyDocument extends Document {
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

MyDocument.getInitialProps = getInitialProps;
