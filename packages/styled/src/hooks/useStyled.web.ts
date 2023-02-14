import { useMemo } from 'react';
import type { ImageStyle, TextStyle, ViewStyle } from 'react-native';
import type { IRegisterComponentArgs } from '@react-universal/core';
import { mergeTWClasses } from '../utils/mergeClasses';

export type Style = ViewStyle & TextStyle & ImageStyle;

function useStyled(data: Omit<IRegisterComponentArgs, 'id'>) {
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

export { useStyled };
