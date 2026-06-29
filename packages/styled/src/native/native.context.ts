import { createContext } from 'react';

export type ContainerContextValue = Record<string, WeakKey>;
export const ContainerContext = createContext<ContainerContextValue>({});
