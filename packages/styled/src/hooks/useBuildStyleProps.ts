import { useEffect, useMemo, useRef } from 'react';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import { twMerge } from 'tailwind-merge';
import type { StyledOptions, StyledProps } from '../types/styled.types';

const useBuildStyleProps = <T, P extends keyof T>(
  {
    className,
    tw,
    ...componentProps
  }: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  styledOptions?: StyledOptions<T, P>,
) => {
  const originalClassProps = useRef(componentProps);
  useEffect(() => {
    originalClassProps.current = componentProps;
  }, [componentProps]);
  return useMemo(() => {
    const props: any = styledOptions?.props;
    const classProps: Record<string, string> = {};
    if (props) {
      for (const item of Object.entries<boolean>(props)) {
        if (item[1]) {
          classProps[item[0]] = twMerge(originalClassProps.current[item[0]]);
        }
      }
    }
    return Object.freeze({
      ...(className || tw || styledOptions?.baseClassName
        ? { style: twMerge(styledOptions?.baseClassName, className ?? tw) }
        : {}),
      ...classProps,
    });
  }, [styledOptions, className, tw]);
};

export { useBuildStyleProps };
