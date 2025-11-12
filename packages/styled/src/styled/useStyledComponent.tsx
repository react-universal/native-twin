import type { PropsFrom } from "@native-twin/helpers";
import { useAtomValue } from "@native-twin/helpers/react";
import { createElement, useId } from "react";
import { TwinStyleSheet } from "../store/TwinStyledSheet";
import { styledJSXStore } from "../store/twinStore";
import type { ComponentConfig, ReactComponent } from "../types/styled.types";

export const useStyledComponent = <C extends ReactComponent<any>>(
  component: C,
  props: PropsFrom<C> & { __twinID?: string },
  _config: ComponentConfig[] = [{ source: "className", target: "style" }]
) => {
  const rID = useId();
  const twinID = props?.__twinID ?? rID;
  console.log("ID: ", twinID);

  const registry = styledJSXStore.getComponent(twinID);

  const interactions = useAtomValue(registry.interactionState);
  const styles = TwinStyleSheet.getComponentStyledProps(twinID, true, true);
  registry.getStyledProps(true, true);

  let newProps = props;
  if (Object.keys(styles).length > 0) {
    newProps = Object.assign({ ...props }, styles, interactions);
  }

  return createElement(component, newProps);
};
