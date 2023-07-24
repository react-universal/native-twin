import { ComponentType, createElement, ReactNode, useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { cx } from '@twind/core';
import type { StyledProps } from '../types/styled.types';

export type Style = ViewStyle & TextStyle & ImageStyle;

function useBuildStyledComponent<T>(
  props: StyledProps,
  Component: ComponentType<T>,
  ref: any,
) {
  const styles = useMemo(() => {
    const mergedClassName = props.className ? cx(...[props.className]) : '';
    // @ts-expect-error
    if (mergedClassName && props.style) {
      // @ts-expect-error
      return [{ $$css: true, [mergedClassName]: mergedClassName } as Style, props.style];
    } else if (mergedClassName) {
      return { $$css: true, [mergedClassName]: mergedClassName } as Style;
      // @ts-expect-error
    } else if (props.style) {
      // @ts-expect-error
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
