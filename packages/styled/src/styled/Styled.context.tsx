import { createContext } from "react";

export interface StyledComponentContainer {
  id: string;
}

export const ContainersContext = createContext<StyledComponentContainer>({
  id: "NONE",
});
