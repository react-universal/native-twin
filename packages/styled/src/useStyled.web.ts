import { CSSProperties, useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { mergeTWClasses } from './utils/mergeClasses';

export type Style = ViewStyle & TextStyle & ImageStyle;

export function useStyle(classValue?: string, style?: CSSProperties) {
  return useMemo(() => {
    const mergedClassName = classValue ? mergeTWClasses(classValue) : undefined;

    if (mergedClassName && style) {
      return [{ $$css: true, [mergedClassName]: mergedClassName } as Style, style];
    } else if (mergedClassName) {
      return { $$css: true, [mergedClassName]: mergedClassName } as Style;
    } else if (style) {
      return style;
    }
    return {};
  }, [style, classValue]);
}
