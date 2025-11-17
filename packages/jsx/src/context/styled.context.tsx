import * as React from "react";
import { StyleSheet } from "../sheet/StyleSheet";
import type { NativeTwinProps } from "../utils/constants";

export type ChildStylesContextFn = (
  ord: number,
  lastOrd: number
) => Record<string, any>;

export let GroupContext: any = null;
export let ContainersContext: any = null;
export let TwinRootContext: any = null;

if (typeof window !== "undefined") {
  GroupContext = React.createContext<string | undefined>(undefined);
  ContainersContext = React.createContext<string | null>(null);
  TwinRootContext = React.createContext<boolean>(false);
}

export const withParentContext = function withParentContext<
  Props extends NativeTwinProps
>(func: (props: Props) => React.ReactNode): React.FC<Props> {
  return (props: Parameters<typeof func>[0]): React.ReactNode => {
    const refProps = props as NativeTwinProps;
    const state = StyleSheet.getComponentState(refProps.__twinID).get();
    if (typeof window === "undefined" && typeof document === "undefined") {
      console.log("asdasdad");
      return func(props);
    }
    if (state.meta.isGroupParent) {
      return (
        <GroupContext.Provider value={refProps.__twinID}>
          {func(props)}
        </GroupContext.Provider>
      );
    }
    return func(props);
  };
};
