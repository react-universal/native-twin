import { useMemo } from 'react';
import { parseClassNames } from '../utils/components.utils';
import { useStore } from './useStore';

function useClassNamesTransform(classNames: string) {
  const componentStore = useStore(classNames);
  const parsed = useMemo(() => parseClassNames(classNames), [classNames]);

  return {
    normalStyles: componentStore.normalStyles,
    interactionStyles: componentStore.interactionStyles,
    parsed,
  };
}

export { useClassNamesTransform };
