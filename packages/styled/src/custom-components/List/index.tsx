import { type ComponentType, forwardRef, type PropsWithChildren } from "react";
import {
  Platform,
  Text,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";
import { UL as PrimitiveUL } from "./ul";

type LIProps = TextProps | ViewProps;

function isTextProps(props: any): props is TextProps {
  // Treat <li></li> as a Text element.
  return typeof props.children === "string";
}

const PrimitiveLI = forwardRef(
  (props: PropsWithChildren<LIProps>, ref: any) => {
    if (isTextProps(props)) {
      // @ts-expect-error
      const accessibilityRole: LIProps["accessibilityRole"] = Platform.select({
        web: "listitem",
        default: props.accessibilityRole,
      });
      return (
        <Text {...props} accessibilityRole={accessibilityRole} ref={ref} />
      );
    }
    // @ts-expect-error
    const accessibilityRole: LIProps["accessibilityRole"] = Platform.select({
      web: "listitem",
      default: props.accessibilityRole,
    });
    return <View {...props} accessibilityRole={accessibilityRole} ref={ref} />;
  }
) as ComponentType<LIProps>;

PrimitiveLI.displayName = "LI";

const UL = PrimitiveUL;
const LI = PrimitiveLI;

export { LI, UL };
