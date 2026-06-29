import { cx, tw } from "@native-twin/core";
import { hasOwnProperty } from "@native-twin/helpers";
import { createElement, forwardRef } from "react";
import { withParentContext } from "../../context";
import type { JSXFunction } from "../../types/jsx.types";
import type { StylableComponentConfigOptions } from "../../types/styled.types";
import { getNormalizeConfig } from "../../utils/config.utils";
import {
  labelPropName,
  type NativeTwinProps,
  REACT_FORWARD_REF_SYMBOL,
  typePropName,
} from "../../utils/constants";
import { getComponentDisplayName } from "../../utils/react.utils";
import { getLabelFromStackTrace } from "../native/get-label-from-stack-trace";

// TODO: Check this on every react web fmw
export const stylizedComponents = new Map<
  object | string,
  Parameters<JSXFunction>[0]
>();

export const mappedComponentsConfig = new Map<
  object | string,
  StylableComponentConfigOptions<any>
>();

type JSXTarget = Record<string, any> | Record<string, any>[];
export const createStylableComponent = (baseComponent: any, mapping: any) => {
  const configs = getNormalizeConfig(mapping);

  if (configs.length === 0) {
    configs.push({ source: "className", target: "style" });
  }

  /**
   * Turns this:
   *   <View className="text-red-500" />
   * Into this:
   *   <View style={{ $$css: true, "text-red-500": "text-red-500"}} />
   */
  const twinComponent = forwardRef(function TwinComponent(
    { ...props }: any,
    ref: any
  ) {
    if (props["twEnabled"] === false) {
      return createElement(baseComponent, props);
    }

    // if (typeof baseComponent === 'string') {
    //   return createElement(baseComponent, props);
    // }

    props = { ...props, ref };
    for (const config of configs) {
      const originalTarget: JSXTarget = props[config.target] ?? {};

      let target: JSXTarget = Array.isArray(originalTarget)
        ? [...originalTarget]
        : { ...originalTarget, $$css: true };
      let source = props[config.source];

      // Ensure we only add non-empty strings
      if (source && typeof source === "string" && source.length > 0) {
        source = cx`${source}`;
        const injected = tw(`${source}`);
        if (injected && injected.length > 0) {
          if (Array.isArray(target)) {
            target.push({
              $$css: true,
              [source]: source,
            });
          } else {
            target = {
              ...target,
              [source]: source,
            };
          }
        }
        props[config.target] = target;
      }
    }

    if (
      "$$typeof" in baseComponent &&
      typeof baseComponent === "function" &&
      baseComponent.$$typeof === REACT_FORWARD_REF_SYMBOL
    ) {
      delete props?.["twEnabled"];
      return (baseComponent as any).render(props, props["ref"]);
    } else if (typeof baseComponent === "function") {
      delete props?.["twEnabled"];
      return (baseComponent as any)(props);
    } else {
      return createElement(baseComponent, props);
    }
  });
  // if (typeof window !== 'undefined') {
  twinComponent.displayName = `Twin.${
    baseComponent.displayName ?? baseComponent.name ?? "unknown"
  }`;
  // }

  stylizedComponents.set(baseComponent, twinComponent);
  mappedComponentsConfig.set(baseComponent, mapping);
  return twinComponent;
};

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

    const newProps: Record<string, unknown> = {};
    const normalized = getNormalizeConfig(props.mappings);

    for (const config of normalized) {
      const originalTarget: JSXTarget = props[config.target] ?? {};

      let target: JSXTarget = Array.isArray(originalTarget)
        ? [...originalTarget]
        : { ...originalTarget, $$css: true };
      let source = props[config.source] as string;

      // Ensure we only add non-empty strings
      if (source && typeof source === "string" && source.length > 0) {
        source = cx`${source}`;
        const injected = tw(`${source}`);
        if (injected && injected.length > 0) {
          if (Array.isArray(target)) {
            target.push({
              $$css: true,
              [source]: source,
            });
          } else {
            target = {
              ...target,
              [source]: source,
            };
          }
        }
        props[config.target] = target;
        console.log("PROPS: ", props[config.target]);
        console.log("PROPS: ", props[config.source]);
      }
    }

    // Reflect.deleteProperty(newProps, "__twinID");
    // Reflect.deleteProperty(newProps, "__parentID");
    return <WrappedComponent {...newProps} />;
  }
);

if (__DEV__) {
  TwinElement.displayName = `Twin(${getComponentDisplayName(
    TwinElement as any
  )})` as any;
}

export const withMappedProps = createStylableComponent;

export const useUnstableNativeVariable = (_name: string) => {
  if (process.env["NODE_ENV"] !== "production") {
    console.warn("useUnstableNativeVariable is not supported on web.");
  }
  return undefined;
};

export function vars<T extends Record<`--${string}`, string | number>>(
  variables: T
) {
  const $variables: Record<string, string> = {};

  for (const [key, value] of Object.entries(variables)) {
    if (key.startsWith("--")) {
      $variables[key] = value.toString();
    } else {
      $variables[`--${key}`] = value.toString();
    }
  }
  return $variables;
}

export function useSafeAreaEnv(): {} | undefined {
  return undefined;
}
