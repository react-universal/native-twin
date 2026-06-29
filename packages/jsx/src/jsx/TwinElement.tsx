import { hasOwnProperty } from "@native-twin/helpers";
import { forwardRef } from "react";
import type { JSXInternalProps } from "../types/jsx.types";

const typePropName = "__NATIVE_TWIN_TYPE_PLEASE_DO_NOT_USE__";

interface TwinProps extends JSXInternalProps {
  [typePropName]: React.ElementType;
  [key: string]: unknown;
}

export const createTwinProps = (
  type: React.ElementType,
  props: JSXInternalProps
): TwinProps => {
  const newProps = {} as TwinProps;

  for (const key in props) {
    if (hasOwnProperty.call(props, key)) {
      newProps[key] = props[key as keyof typeof props];
    }
  }

  newProps[typePropName] = type;

  return newProps;
};

let withTwinProperties = function withTwinProperties<Props, RefType = any>(
  func: (
    props: React.PropsWithoutRef<Props>,
    ref?: React.ForwardedRef<RefType>
  ) => React.ReactNode
):
  | React.FC<React.PropsWithoutRef<Props> & React.RefAttributes<RefType>>
  | React.ForwardRefExoticComponent<
      React.PropsWithoutRef<Props> & React.RefAttributes<RefType>
    > {
  return forwardRef<RefType, Props>((props, ref) => {
    return func(props as React.PropsWithoutRef<Props>, ref);
  });
};

export default function memoize<V>(fn: (arg: string) => V): (arg: string) => V {
  const cache: Record<string, V> = Object.create(null);

  return (arg: string) => {
    if (cache[arg] === undefined) cache[arg] = fn(arg);
    return cache[arg];
  };
}

let cache: null | Record<string, string> = null;
if (typeof window === "undefined") {
  withTwinProperties = function withTwinProperties(func) {
    return (props: Parameters<typeof func>[0]) => {
      if (cache === null) {
        cache = memoize((): any => ({})) as any;
        // yes, we're potentially creating this on every render
        // it doesn't actually matter though since it's only on the server
        // so there will only every be a single render
        // that could change in the future because of suspense and etc. but for now,
        // this works and i don't want to optimise for a future thing that we aren't sure about
        return func(props);
        // (
        //   // <CacheContext.Provider value={(cache as any)() as any}>
        //     {}
        //   {/* </CacheContext.Provider> */}
        // );
      } else {
        return func(props);
      }
    };
  };
}

export const TwinElement = /* #__PURE__ */ withTwinProperties<TwinProps>(
  (props, ref) => {
    const WrappedComponent = props[
      typePropName
    ] as TwinProps[typeof typePropName];

    const newProps: Record<string, unknown> = {};
    for (const key in props) {
      if (hasOwnProperty.call(props, key) && key !== typePropName) {
        newProps[key] = props[key];
      }
    }
    if (ref) {
      newProps["ref"] = ref;
    }

    return <WrappedComponent {...newProps} />;
  }
);

TwinElement.displayName = "NativeTwinPropInternal";
