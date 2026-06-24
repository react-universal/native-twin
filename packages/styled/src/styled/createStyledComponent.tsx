import type { PropsFrom } from "@native-twin/helpers";
import type { ComponentType } from "react";
import type {
  ReactComponent,
  StyledConfiguration,
} from "../types/styled.types";
import { getNormalizeConfig } from "../utils/component.config";
import { useStyledComponent } from "./useStyledComponent";

const defaultMapping: StyledConfiguration<ComponentType<{ style: unknown }>> = {
  className: "style",
};

export const createStyled = <
  const C extends ReactComponent<any>,
  const M extends StyledConfiguration<C>
>(
  targetComponent: C,
  mapping: M = defaultMapping as unknown as M
) => {
  console.log("TARGET: ", targetComponent);
  const configs = getNormalizeConfig(mapping);
  const finalComponent = (props: PropsFrom<C>) => {
    console.log("PROPS: ", props);
    return useStyledComponent(targetComponent, props, configs);
  };

  const name =
    targetComponent.displayName ?? targetComponent["name"] ?? "unknown";
  finalComponent.displayName = `TwinComponent.${name}`;
  console.log("FINAL: ", finalComponent);
  return targetComponent;
};
