/* eslint-disable unused-imports/no-unused-vars */
import { ComponentType, createElement, ReactNode, useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { StyledProps } from '@universal-labs/stylesheets';

export type Style = ViewStyle & TextStyle & ImageStyle;

function useBuildStyledComponent<T, P extends keyof T>(
  props: StyledProps<T>,
  Component: ComponentType<T>,
  ref: any,
  styleClassProps?: P[],
) {
  const styles = useMemo(() => {
    const mergedClassName = props.className ? `${props.className}` : '';

    if (mergedClassName && props.style) {
      return [{ $$css: true, [mergedClassName]: mergedClassName } as Style, props.style];
    } else if (mergedClassName) {
      return { $$css: true, [mergedClassName]: mergedClassName } as Style;
    } else if (props.style) {
      return props.style;
    }
    return {};
  }, [props]);

  // @ts-expect-error
  const transformedComponent = createElement(Component, {
    ...props,
    style: [styles],
    ref,
  } as unknown as T);
  let returnValue: ReactNode = transformedComponent;

  return returnValue;
}

export { useBuildStyledComponent };