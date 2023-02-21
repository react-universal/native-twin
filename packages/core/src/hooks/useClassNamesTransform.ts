import { useMemo } from 'react';
import { parseClassNames } from '../utils/components.utils';
import { useTailwind } from './useTailwind';

function useClassNamesTransform(classNames: string) {
  const tail = useTailwind(classNames);
  // console.log('TAILWIND: ', tail);
  const parsed = useMemo(() => parseClassNames(classNames), [classNames]);

  return {
    normalStyles: tail.normalStyles,
    interactionStyles: tail.interactionStyles,
    parsed,
  };
}

export { useClassNamesTransform };
