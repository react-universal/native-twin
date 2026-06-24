import {
  type KeyboardAvoidingViewProps,
  KeyboardAvoidingView as RNKeyboardAvoidingView,
} from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNKeyboardAvoidingView> = {
  className: {
    target: "style",
  },
};

export const KeyboardAvoidingView = copyComponentProperties(
  RNKeyboardAvoidingView,
  (props: KeyboardAvoidingViewProps) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNKeyboardAvoidingView, props, config);
  }
);

export default KeyboardAvoidingView;
