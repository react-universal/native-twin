import { createContext, ReactNode, useContext } from 'react';
import type { IComponentState } from '../types/styles.types';

export type ITailwindContext = {
  groupID: string | null;
  parentState: IComponentState;
};

const TailwindContext = createContext<ITailwindContext>({
  groupID: null,
  parentState: {
    'group-hover': { value: false },
    active: { value: false },
    dark: { value: false },
    focus: { value: false },
    hover: { value: false },
  },
});

const useTailwindContext = () => useContext(TailwindContext);

interface ITailwindContextProviderProps {
  children: ReactNode;
  parentState: IComponentState;
  groupID?: string | null;
}
const TailwindContextProvider = ({
  children,
  parentState,
  groupID = null,
}: ITailwindContextProviderProps) => {
  return (
    <TailwindContext.Provider value={{ parentState, groupID }}>
      {children}
    </TailwindContext.Provider>
  );
};

export { TailwindContext, useTailwindContext, TailwindContextProvider };
