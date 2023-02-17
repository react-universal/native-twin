import { createContext, ReactNode, useContext } from 'react';

export type IGroupContext =
  | {
      isHover: boolean;
    }
  | undefined;

const GroupContext = createContext<IGroupContext>(undefined);

const useGroupContext = () => useContext(GroupContext);

const GroupContextProvider = ({
  children,
  isHover,
}: {
  children: ReactNode;
  isHover: boolean;
}) => {
  return <GroupContext.Provider value={{ isHover }}>{children}</GroupContext.Provider>;
};

export { GroupContext, useGroupContext, GroupContextProvider };
