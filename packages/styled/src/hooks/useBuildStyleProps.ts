import { useMemo } from 'react';
import type { StyledProps } from '@universal-labs/stylesheets';
import { twMerge } from 'tailwind-merge';

const useBuildStyleProps = <T, P extends keyof T>(
  componentProps: StyledProps<T>,
  styleClassProps?: P[],
) => {
  const classPropsTuple = useMemo(() => {
    if (!styleClassProps) return [];
    const props = styleClassProps.reduce((prev, current) => {
      const propValue = twMerge(componentProps[current] as string);
      prev.push([current as string, propValue]);
      return prev;
    }, [] as [string, string][]);
    return props;
  }, [componentProps, styleClassProps]);

  return {
    className: twMerge(componentProps.className ?? componentProps.tw),
    classPropsTuple,
  };

  // return useMemo(() => {
  //   const props = styleClassProps;
  //   const classProps: [P, T[P]][] = [];
  //   if (props) {
  //     for (const item of props) {
  //       classProps[item] = twMerge(originalClassProps.current[item]);
  //     }
  //   }
  //   return Object.freeze({
  //     ...(className || tw ? { style: twMerge(className ?? tw) } : {}),
  //     ...classProps,
  //   });
  // }, [classPropsTuple]);
};

export { useBuildStyleProps };
