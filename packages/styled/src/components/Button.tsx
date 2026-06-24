import { type ButtonProps, Button as RNButton } from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNButton> = {
  className: {
    target: false,
    nativeStyleMapping: {
      color: "color",
    },
  },
};

export const Button = copyComponentProperties(
  RNButton,
  (props: ButtonProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNButton, props, config);
  }
);

export default Button;
