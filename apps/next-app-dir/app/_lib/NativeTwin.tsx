'use client';

import { ReactNode } from 'react';
import { installApp } from '@native-twin/nextjs/_app';
import tailwindConfig from '../../tailwind.config';

const NativeTwin = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default installApp(tailwindConfig, NativeTwin);
