/* eslint-disable unused-imports/no-unused-vars */
import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { IRegisterComponentArgs } from '@universal-labs/stylesheets';

export type Style = ViewStyle & TextStyle & ImageStyle;

function useStyledComponent<T, P extends keyof T>(
  data: Omit<IRegisterComponentArgs, 'id'>,
  styledOptions?: P[],
) {
  return useMemo(() => {
    const mergedClassName = data.className ? `${data.className}` : '';

    if (mergedClassName && data.inlineStyles) {
      return [{ $$css: true, [mergedClassName]: mergedClassName } as Style, data.inlineStyles];
    } else if (mergedClassName) {
      return { $$css: true, [mergedClassName]: mergedClassName } as Style;
    } else if (data.inlineStyles) {
      return data.inlineStyles;
    }
    return {};
  }, [data]);
}

export { useStyledComponent };
