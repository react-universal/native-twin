import { useMemo } from 'react';
import type { StyledProps } from '@universal-labs/stylesheets';
import { twMerge } from 'tailwind-merge';

const useBuildStyleProps = <T, P extends keyof T>(
  componentProps: StyledProps<T>,
  styleClassProps: P[] = [],
) => {
  const classPropsTuple = useMemo(() => {
    return styleClassProps.reduce((prev, current) => {
      const propValue = twMerge(componentProps[current] as string);
      prev.push([current as string, propValue]);
      return prev;
    }, [] as [string, string][]);
  }, [componentProps, styleClassProps]);

  return {
    className: twMerge(componentProps.className ?? componentProps.tw),
    classPropsTuple,
  };
};

export { useBuildStyleProps };
