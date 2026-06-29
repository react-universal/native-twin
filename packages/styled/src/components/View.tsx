import { View as RNView, type ViewProps } from "react-native";
import type { StyledConfiguration, StyledProps } from "../models/Styled.models";
import { useStyledElement } from "../native/useStyledElement";
import { copyComponentProperties } from "./_hoistProps/hoistComponentProps";

const mapping = {
  className: {
    target: "style",
  },
} satisfies StyledConfiguration<typeof RNView>;

export const View = copyComponentProperties(
  RNView,
  (props: StyledProps<ViewProps, typeof mapping>) => {
    return useStyledElement(RNView, props, mapping);
  }
);

export default View;
