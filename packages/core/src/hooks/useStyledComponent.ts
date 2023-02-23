import { ReactNode, useMemo } from 'react';
import { useTailwindContext } from '../context/TailwindContext';
import { useChildren } from './useChildren';
import { useClassNamesTransform } from './useClassNamesTransform';
import { useComponentInteractions } from './useComponentInteractions';
import { useFinalStyles } from './useFinalStyles';

const useStyledComponent = (className = '', children: ReactNode) => {
  const tailwindContext = useTailwindContext();
  const { interactionStyles, normalStyles, parsed } = useClassNamesTransform(className);
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
  const componentChilds = useChildren(children);

  return {
    styles,
    panHandlers,
    isGroupParent,
    componentChilds,
    hasInteractions,
    componentState,
    tailwindContext,
    // children,
  };
};

export { useStyledComponent };
