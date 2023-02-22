import { createContext, ReactNode, useContext } from 'react';
import type { IComponentState } from '../styled.types';

export type ITailwindContext = {
  parentState: IComponentState;
};

const TailwindContext = createContext<ITailwindContext>({
  parentState: {
    'group-hover': false,
    active: false,
    dark: false,
    focus: false,
    hover: false,
  },
});

const useTailwindContext = () => useContext(TailwindContext);

interface ITailwindContextProviderProps {
  children: ReactNode;
  parentState: IComponentState;
}
const TailwindContextProvider = ({ children, parentState }: ITailwindContextProviderProps) => {
  return (
    <TailwindContext.Provider value={{ parentState }}>{children}</TailwindContext.Provider>
  );
};

export { TailwindContext, useTailwindContext, TailwindContextProvider };
