import type { RuntimeTwinComponentProps } from '@native-twin/css/build/dts/jsx';
import { createContext } from 'react';

export type ChildStylesContextFn = (ord: number, lastOrd: number) => Record<string, any>;

export const groupContext = createContext<string | undefined>(undefined);
export const ContainersContext =
  createContext<RuntimeTwinComponentProps['_twinInjected']>(undefined);
export const TwinRootContext = createContext<boolean>(false);
