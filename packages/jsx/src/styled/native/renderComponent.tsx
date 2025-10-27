import { type ComponentType, createElement } from "react";
import type { JSXInternalProps } from "../../types/jsx.types";
import { getComponentType } from "../../utils/react.utils";

export const renderComponent = (
  baseComponent: ComponentType<any>,
  props: JSXInternalProps,
  _ref: any
) => {
  const component = baseComponent;
  const twinProps = props?.["_twinInjected"];

  // useEffect(() => {
  //   const child = childFiber.current;
  //   if (child && twinProps && twinProps.index >= 0) {
  //     if (twinProps.id === '#51553j') {
  //       const childTwinProps = childFiber.current.canonical.currentProps?._twinInjected;
  //       console.log('CHILD_TWIN_PROPS', childTwinProps);
  //     }
  //   }
  // }, [twinProps]);
  if (props?.["children"] && twinProps) {
    console.log("HAS_CHILD: ", twinProps.id);
  }
  if (props?.["__twinID"]) {
    console.log("ID: ", props);
  }

  switch (getComponentType(component)) {
    case "forwardRef": {
      const ref = props["ref"];
      delete props["ref"];
      return (component as any).render(props, ref);
    }
    case "function":
      return (component as any)(props);
    case "string":
    case "object":
    case "class":
    case "unknown":
      return createElement(component, props);
  }
};
