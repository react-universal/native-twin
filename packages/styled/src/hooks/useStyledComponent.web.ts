import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import { mergeTWClasses } from '@universal-labs/stylesheets';
import type { IRegisterComponentArgs } from '../types/store.types';

export type Style = ViewStyle & TextStyle & ImageStyle;

function useStyledComponent(data: Omit<IRegisterComponentArgs, 'id'>) {
  return useMemo(() => {
    const mergedClassName = data.className ? mergeTWClasses(data.className) : undefined;

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