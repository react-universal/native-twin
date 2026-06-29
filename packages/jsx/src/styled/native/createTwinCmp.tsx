import { hasOwnProperty, keysOf } from "@native-twin/helpers";
import React from "react";
import { GroupContext, withParentContext } from "../../context";
import { StyleSheet } from "../../sheet";
import type { JSXFunction } from "../../types/jsx.types";
import type {
  ReactComponent,
  StylableComponentConfigOptions,
} from "../../types/styled.types";
import { getNormalizeConfig } from "../../utils/config.utils";
import {
  labelPropName,
  type NativeTwinProps,
  typePropName,
} from "../../utils/constants";
import {
  getComponentDisplayName,
  getComponentType,
} from "../../utils/react.utils";
import { useRenderCounter } from "../hooks/useRenderCounter";
import { useStyledProps } from "../hooks/useStyledProps";
import { getLabelFromStackTrace } from "./get-label-from-stack-trace";

export const stylizedComponents = new Map<
  object | string,
  Parameters<JSXFunction>[0]
>();

export const mappedComponentsConfig = new Map<
  object | string,
  StylableComponentConfigOptions<any>
>();

export const createTwinProps = (
  type: React.ElementType,
  props: NativeTwinProps,
  mappings: StylableComponentConfigOptions<any>
) => {
  const newProps = { mappings } as NativeTwinProps;

  for (const key in props) {
    if (__DEV__ && hasOwnProperty.call(props, key)) {
      newProps[key] = props[key as keyof typeof props];
    }
  }

  newProps[typePropName] = type;

  if (
    __DEV__ &&
    globalThis !== undefined &&
    typeof props.__twinID === "string"
  ) {
    const label = getLabelFromStackTrace(new Error().stack);
    if (label) newProps[labelPropName] = label;
  }

  return newProps;
};

export const TwinElement = /* #__PURE__ */ withParentContext<NativeTwinProps>(
  (props) => {
    const WrappedComponent = props[
      typePropName
    ] as NativeTwinProps[typeof typePropName];

    const { compiledProps, handlers } = useStyledProps(props);

    const newProps: Record<string, unknown> = {};

    for (const key in props) {
      if (
        hasOwnProperty.call(props, key) &&
        key !== typePropName &&
        key !== labelPropName &&
        (!__DEV__ || key !== labelPropName)
      ) {
        newProps[key] = props[key];
      }
    }

    for (const key in compiledProps) {
      newProps[key] = StyleSheet.flatten([newProps[key], compiledProps[key]]);
    }
    for (const key of keysOf(handlers)) {
      newProps[key] = handlers[key];
    }

    Reflect.deleteProperty(newProps, "__twinID");
    Reflect.deleteProperty(newProps, "__parentID");
    console.log("Render #", useRenderCounter());
    return <WrappedComponent {...newProps} />;
  }
);

if (__DEV__) {
  TwinElement.displayName = `Twin(${getComponentDisplayName(
    TwinElement as any
  )})` as any;
}

export function NativeTwinHOC<
  const T extends ReactComponent<any>,
  const M extends StylableComponentConfigOptions<any>
>(
  Component: Parameters<JSXFunction>[0],
  mapping: StylableComponentConfigOptions<T> & M
) {
  const component: any = Component;
  const configs = getNormalizeConfig(mapping);

  const TwinElementType = (props: any) => {
    const prevProps = React.useRef<Record<string, unknown>>(props);
    const { compiledProps, state, registry, handlers } = useStyledProps(props);
    // const twinRoot = useContext(TwinRootContext);
    const newProps = {
      ...props,
      ...handlers,
    };

    for (const propKey in compiledProps) {
      const oldProps = newProps[propKey] ? { ...newProps[propKey] } : {};
      newProps[propKey] = Object.assign({}, compiledProps[propKey], oldProps);
    }
    prevProps.current = newProps;

    if (state.meta.isGroupParent) {
      return React.createElement(
        GroupContext.Provider,
        { value: registry.id },
        React.createElement(component, newProps)
      );
    }

    Reflect.deleteProperty(newProps, "__twinID");
    Reflect.deleteProperty(newProps, "__parentID");
    for (const source of configs) {
      Reflect.deleteProperty(newProps, source.source);
    }

    if (component === Component) {
      switch (getComponentType(component)) {
        case "forwardRef": {
          // console.log("FORWARD: ", props?.["__twinID"]);
          const ref = newProps["ref"];
          delete newProps["ref"];
          return (component as any).render(newProps, ref);
        }
        case "function":
          const ref = newProps["ref"];
          if (typeof ref === "function") {
            return (ref as any)(newProps);
          }
          return (component as any)(newProps);
        case "string":
        case "object":
        case "class":
        case "unknown":
          return <Component {...newProps} />;
      }
    } else {
      return <Component {...newProps} />;
    }
  };

  stylizedComponents.set(Component, TwinElementType);
  mappedComponentsConfig.set(Component, mapping);

  if (__DEV__) {
    TwinElement.displayName =
      Component.name ??
      Component.displayName ??
      `Twin(${getComponentDisplayName(Component)})`;
  }
  // TwinComponent.whyDidYouRender = true;

  return TwinElement;
}

export const createStylableComponent = NativeTwinHOC;
