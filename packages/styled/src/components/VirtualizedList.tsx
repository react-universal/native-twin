import type { ReactNode } from "react";
import {
  VirtualizedList as RNVirtualizedList,
  type VirtualizedListProps,
} from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNVirtualizedList> = {
  className: "style",
  ListFooterComponentClassName: "ListFooterComponentStyle",
  ListHeaderComponentClassName: "ListHeaderComponentStyle",
  contentContainerClassName: "contentContainerStyle",
};

export const VirtualizedList = copyComponentProperties(
  RNVirtualizedList,
  <ItemT,>(props: VirtualizedListProps<ItemT>) => {
    const config = getNormalizeConfig(mapping);
    // FIXME: add correct typing
    return useStyledComponent(RNVirtualizedList, props as any, config);
  }
) as unknown as typeof RNVirtualizedList &
  (<ItemT>(props: VirtualizedListProps<ItemT>) => ReactNode);

export default VirtualizedList;
