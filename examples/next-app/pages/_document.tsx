import React from 'react';
import { AppRegistry } from 'react-native';
import { installDocument } from '@universal-labs/native-tailwind-nextjs/_document';
import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
  DocumentInitialProps,
} from 'next/document';

export async function getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
  AppRegistry.registerComponent('Main', () => Main);
  // @ts-expect-error
  const { getStyleElement } = AppRegistry.getApplication('Main');
  const page = await ctx.renderPage();
  const styles = [getStyleElement()];
  return { ...page, styles: React.Children.toArray(styles) };
}

class MyDocument extends Document {
  getInitialProps = getInitialProps;
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
