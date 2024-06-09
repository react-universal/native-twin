'use client';

import { createElement, Fragment, ReactNode, useState } from 'react';
// import { StyleSheet } from 'react-native';
import { useServerInsertedHTML } from 'next/navigation';
import { install, TailwindConfig, TailwindUserConfig } from '@native-twin/core';
import { sheetEntriesToCss, SheetEntry } from '@native-twin/css';

interface AppComponentProps {
  children: ReactNode;
}
export const NativeTwinSheet = (twinConfig: TailwindUserConfig | TailwindConfig) => {
  const AppComponent = ({ children }: AppComponentProps) => {
    const [twin] = useState(() => {
      let config = twinConfig as TailwindUserConfig;
      if (twinConfig.mode !== 'web') {
        config = Object.assign({ mode: 'web' }, twinConfig) as TailwindUserConfig;
      }
      return install(config, !__DEV__);
    });
    useServerInsertedHTML(() => {
      // const rnSheet = StyleSheet.getSheet();
      const styles = createElement(
        Fragment,
        null,
        createElement('style', {
          'data-native-twin': '',
          nonce: null,
          dangerouslySetInnerHTML: {
            __html: sheetEntriesToCss(twin.target as SheetEntry[]),
          },
        }),
        // createElement('style', {
        //   nonce: null,
        //   id: rnSheet.id,
        //   dangerouslySetInnerHTML: {
        //     __html: rnSheet.textContent,
        //   },
        // }),
      );
      return styles;
    });
    return <>{children}</>;
  };

  return AppComponent;
};
