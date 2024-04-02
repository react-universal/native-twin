import { createContext } from 'react';

export type ChildStylesContextFn = (ord: number, lastOrd: number) => Record<string, any>;

// export const groupContext = createContext<ChildStylesContextFn | undefined>(undefined);
export const groupContext = createContext<string | undefined>(undefined);
