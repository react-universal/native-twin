import {
  type ActivityIndicatorProps,
  ActivityIndicator as RNActivityIndicator,
} from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration, StyledProps } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNActivityIndicator> = {
  className: {
    target: "style",
    nativeStyleMapping: {
      color: "color",
    },
  },
};

export const ActivityIndicator = copyComponentProperties(
  RNActivityIndicator,
  (props: StyledProps<ActivityIndicatorProps, typeof mapping>) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNActivityIndicator, props, config);
  }
);

export default ActivityIndicator;
