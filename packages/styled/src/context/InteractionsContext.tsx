import { createContext, ReactNode, useContext } from 'react';

const InteractionsContext = createContext({
  isHover: false,
});

const useInteractionsContext = () => useContext(InteractionsContext);

const InteractionsContextProvider = ({
  children,
  isHover,
}: {
  children: ReactNode;
  isHover: boolean;
}) => {
  return (
    <InteractionsContext.Provider value={{ isHover }}>{children}</InteractionsContext.Provider>
  );
};

export { InteractionsContext, useInteractionsContext, InteractionsContextProvider };
