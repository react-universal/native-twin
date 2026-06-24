import {
  TouchableHighlight as RNTouchableHighlight,
  type TouchableHighlightProps,
} from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNTouchableHighlight> = {
  className: "style",
};

export const TouchableHighlight = copyComponentProperties(
  RNTouchableHighlight,
  (props: TouchableHighlightProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNTouchableHighlight, props, config);
  }
);

export default TouchableHighlight;
