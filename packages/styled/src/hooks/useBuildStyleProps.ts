import { useEffect, useMemo, useRef } from 'react';
import type { StyledProps } from '@universal-labs/stylesheets';
import { twMerge } from 'tailwind-merge';

const useBuildStyleProps = <T, P extends keyof T>(
  { className, tw, ...componentProps }: StyledProps<T>,
  styleClassProps?: P[],
) => {
  const originalClassProps: any = useRef(componentProps);
  useEffect(() => {
    originalClassProps.current = componentProps;
  }, [componentProps]);
  return useMemo(() => {
    const props = styleClassProps;
    // @ts-expect-error
    const classProps: Record<P, string> = {};
    if (props) {
      for (const item of props) {
        classProps[item] = twMerge(originalClassProps.current[item]);
      }
    }
    return Object.freeze({
      ...(className || tw ? { style: twMerge(className ?? tw) } : {}),
      ...classProps,
    });
  }, [className, tw, styleClassProps]);
};

export { useBuildStyleProps };
