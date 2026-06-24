import { TextInput as RNTextInput, type TextInputProps } from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNTextInput> = {
  className: {
    target: "style",
    nativeStyleMapping: {
      textAlign: true,
    },
  },
};

export const TextInput = copyComponentProperties(
  RNTextInput,
  (props: TextInputProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNTextInput, props, config);
  }
);

export default TextInput;
