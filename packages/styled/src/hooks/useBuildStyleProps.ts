import { useMemo } from 'react';
import type {
  IExtraProperties,
  TInternalStyledComponentProps,
} from '@universal-labs/stylesheets';
import type { StyledOptions, StyledProps } from '../types/styled.types';

const useBuildStyleProps = <T, P extends keyof T>(
  {
    className,
    tw,
    ...componentProps
  }: StyledProps<IExtraProperties<TInternalStyledComponentProps>>,
  styledOptions?: StyledOptions<T, P>,
) =>
  useMemo(() => {
    const props: any = styledOptions?.props;
    const classProps: Record<string, string> = {};
    if (props) {
      for (const item of Object.entries<boolean>(props)) {
        if (item[1]) {
          classProps[item[0]] = componentProps[item[0]];
        }
      }
    }
    return {
      ...(className || tw || styledOptions?.baseClassName
        ? { style: `${className ?? tw} ${styledOptions?.baseClassName}` }
        : {}),
      ...classProps,
    };
  }, [styledOptions, className, tw, componentProps]);

export { useBuildStyleProps };
