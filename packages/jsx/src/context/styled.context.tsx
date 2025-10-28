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
  Props extends NativeTwinProps,
  RefType = any
>(
  func: (
    props: React.PropsWithoutRef<Props>,
    ref?: React.ForwardedRef<RefType>
  ) => React.ReactNode
):
  | React.FC<React.PropsWithoutRef<Props> & React.RefAttributes<RefType>>
  | React.ForwardRefExoticComponent<
      React.PropsWithoutRef<Props> & React.RefAttributes<RefType>
    > {
  // return React.forwardRef<RefType, Props>(function TwinWrapper(props, ref) {

  // });
  return (
    props: Parameters<typeof func>[0]
    // ref: Parameters<typeof func>[0]
  ): React.ReactNode => {
    const refProps = props as NativeTwinProps;
    const state = StyleSheet.getComponentState(refProps.__twinID).get();
    if (state.meta.isGroupParent) {
      return (
        <GroupContext.Provider value={refProps.__twinID}>
          {func(props)}
        </GroupContext.Provider>
      );
    }
    // the cache will never be null in the browser

    return func(props);
  };
};

// if (Platform.OS !== "web") {
//   withParentContext = function withParentContext(func) {
//     return (props: Parameters<typeof func>[0]) => {
//       const refProps = props as NativeTwinProps;
//       const state = StyleSheet.getComponentState(refProps.__twinID).get();
//       if (state.meta.isGroupParent) {
//         return (
//           <GroupContext.Provider value={refProps.__twinID}>
//             {func(props)}
//           </GroupContext.Provider>
//         );
//       }
//       return func(props);
//     };
//   };
// }
