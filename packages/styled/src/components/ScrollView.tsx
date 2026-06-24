import { ScrollView as RNScrollView, type ScrollViewProps } from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNScrollView> = {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
};

export const ScrollView = copyComponentProperties(
  RNScrollView,
  (props: ScrollViewProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNScrollView, props, config);
  }
);

export default ScrollView;
