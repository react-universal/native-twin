/* eslint-disable unused-imports/no-unused-vars */
import { useMemo } from 'react';
import { useTailwindContext } from '../context/TailwindContext';
import type { IRegisterComponentArgs } from '../types/store.types';
import { useClassNamesTransform } from './useClassNamesTransform';
import { useComponentInteractions } from './useComponentInteractions';
import { useFinalStyles } from './useFinalStyles';

const useStyledComponent = (
  data: Omit<IRegisterComponentArgs, 'id'>,
  // originalChildren: ReactNode,
  componentProps: any,
  Component: any,
) => {
  const tailwindContext = useTailwindContext();
  const { interactionStyles, normalStyles, parsed } = useClassNamesTransform(
    data.className ?? '',
  );
  const isGroupParent = useMemo(
    () => parsed.normalClassNames.some((item) => item === 'group'),
    [parsed.normalClassNames],
  );
  const { componentState, hasInteractions, panHandlers } = useComponentInteractions({
    interactionStyles,
  });
  const styles = useFinalStyles({
    componentState,
    interactionStyles,
    normalStyles,
    tailwindContext,
    isGroupParent,
  });
  // const children = useChildren(originalChildren, componentState);

  return {
    styles,
    panHandlers,
    isGroupParent,
    hasInteractions,
    componentState,
    tailwindContext,
    // children,
  };
};

export { useStyledComponent };
