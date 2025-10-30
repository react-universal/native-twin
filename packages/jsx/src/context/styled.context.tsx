import * as React from "react";
import { StyleSheet } from "../sheet/StyleSheet";
import type { NativeTwinProps } from "../utils/constants";

export type ChildStylesContextFn = (
  ord: number,
  lastOrd: number
) => Record<string, any>;

export const GroupContext = React.createContext<string | undefined>(undefined);
export const ContainersContext = React.createContext<string | null>(null);
export const TwinRootContext = React.createContext<boolean>(false);

export const withParentContext = function withParentContext<
  Props extends NativeTwinProps
>(
  func: (props: Props) => React.ReactNode
): React.FC<Props> {
  //   > //     React.PropsWithoutRef<Props> & React.RefAttributes<RefType> // | React.ForwardRefExoticComponent<
  // return React.forwardRef<RefType, Props>(function TwinWrapper(props, ref) {

  // });
  return (props: Parameters<typeof func>[0]): React.ReactNode => {
    const refProps = props as NativeTwinProps;
    const state = StyleSheet.getComponentState(refProps.__twinID).get();
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
