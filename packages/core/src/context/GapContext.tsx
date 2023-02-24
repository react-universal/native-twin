import { createContext, PropsWithChildren, useContext } from 'react';

type IGapContext =
  | {
      gap?: number;
      columnGap?: number;
      rowGap?: number;
    }
  | undefined;

const GapContext = createContext<IGapContext>(undefined);

const useGapContext = () => useContext(GapContext);

const GapProvider = ({ gap, columnGap, rowGap, children }: PropsWithChildren<IGapContext>) => {
  return (
    <GapContext.Provider value={{ gap, columnGap, rowGap }}>{children}</GapContext.Provider>
  );
};

export { useContext, useGapContext, GapProvider, type IGapContext };
