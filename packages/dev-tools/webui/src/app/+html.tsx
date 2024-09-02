import './twin.css';
import { sheetEntriesToCss } from '@native-twin/css';
import { useEffect, useState, type PropsWithChildren } from 'react';
// import { getRootComponent } from 'expo-router/build/static/getRootComponent';
import { ScrollViewStyleReset } from 'expo-router/html';
import twinConfig from 'tailwind.config';
import { install, TailwindUserConfig, tw } from '@native-twin/core';

if (typeof window !== 'undefined') {
  console.log('+HTML_CLIENT');
}
let config = twinConfig as TailwindUserConfig;
if (twinConfig.mode !== 'web') {
  config = Object.assign({ mode: 'web' }, twinConfig) as TailwindUserConfig;
}
const _____twin = install(config, !__DEV__);

console.log('__TWIN: ', (_____twin.target as any[]).length);

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  console.log('+HTML_TWIN_LENGTH: ', ((tw.target as any[]) ?? []).length);
  useState(() => {
    if (typeof window === 'undefined') {
      console.log('+HTML_SERVER_useState: ');
    } else {
      console.log('+HTML_CLIENT_useState: ');
    }
  });
  useEffect(() => {
    if (typeof window === 'undefined') {
      console.log('+HTML_SERVER_useEffect: ');
    } else {
      console.log('+HTML_CLIENT_useEffect: ');
    }
  }, []);
  return (
    <html>
      <head>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, shrink-to-fit=no'
        />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />
        {/* Add any additional <head> elements that you want globally available on web... */}
        <style
          rel='stylesheet'
          data-native-twin-asdasdasd=''
          dangerouslySetInnerHTML={{
            __html: `${sheetEntriesToCss((tw.target as any[]) ?? [], true)}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
