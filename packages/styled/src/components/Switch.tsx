import { Switch as RNSwitch, type SwitchProps } from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping = {
  className: "style",
} satisfies StyledConfiguration<typeof RNSwitch>;

export const Switch = copyComponentProperties(
  RNSwitch,
  (props: SwitchProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNSwitch, props, config);
  }
);

export default Switch;
