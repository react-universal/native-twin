import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { IRegisterComponentArgs } from '@universal-labs/stylesheets';

export type Style = ViewStyle & TextStyle & ImageStyle;

function useStyledComponent(data: Omit<IRegisterComponentArgs, 'id'>, baseClassName: string) {
  return useMemo(() => {
    const mergedClassName = data.className
      ? `${baseClassName} ${data.className}`
      : baseClassName;

    if (mergedClassName && data.inlineStyles) {
      return [{ $$css: true, [mergedClassName]: mergedClassName } as Style, data.inlineStyles];
    } else if (mergedClassName) {
      return { $$css: true, [mergedClassName]: mergedClassName } as Style;
    } else if (data.inlineStyles) {
      return data.inlineStyles;
    }
    return {};
  }, [data, baseClassName]);
}

export { useStyledComponent };
