import {
  type ImageBackgroundProps,
  ImageBackground as RNImageBackground,
} from "react-native";
import { useStyledComponent } from "../styled/useStyledComponent";
import type { StyledConfiguration, StyledProps } from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { copyComponentProperties } from "./utils/_hoistComponentProps";

const mapping: StyledConfiguration<typeof RNImageBackground> = {
  className: {
    target: "style",
    nativeStyleMapping: {
      backgroundColor: true,
    },
  },
};

export const ImageBackground = copyComponentProperties(
  RNImageBackground,
  (props: StyledProps<ImageBackgroundProps, typeof mapping>) => {
    const config = getNormalizeConfig(mapping);
    return useStyledComponent(RNImageBackground, props, config);
  }
);

export default ImageBackground;
