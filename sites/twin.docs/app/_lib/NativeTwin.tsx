'use client';

import { ReactNode, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { install, TailwindUserConfig } from '@native-twin/core';
import { sheetEntriesToCss, SheetEntry } from '@native-twin/css';
import { NativeTwinSheet } from '@native-twin/nextjs/app';
import tailwindConfig from '../../tailwind.config';

const NativeTwin = ({ children }: { children: ReactNode }) => {
  const [twin] = useState(() => {
    let config = tailwindConfig as TailwindUserConfig;
    if (tailwindConfig.mode !== 'web') {
      config = Object.assign({ mode: 'web' }, tailwindConfig) as TailwindUserConfig;
    }
    return install(config, !__DEV__);
  });
  useServerInsertedHTML(() => {
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: sheetEntriesToCss(twin.target as SheetEntry[]),
        }}
      />
    );
  });
  return <>{children}</>;
};

// export default installApp(tailwindConfig, NativeTwin);

export default NativeTwin;
export const TwinComponent = NativeTwinSheet(tailwindConfig);
