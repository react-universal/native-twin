import type { IRegisterComponentArgs } from '../types/store.types';
import { useClassNamesTransform } from './useClassNamesTransform';

// import { useComponentStore } from './useComponentStore';

function useTailwind(data: Omit<IRegisterComponentArgs, 'id'>) {
  const { interactionStyles, normalStyles } = useClassNamesTransform(data.className ?? '');

  return {
    styles: normalStyles,
    hasInteractions: interactionStyles.length > 0,
    interactionStyles: interactionStyles,
  };
}

export { useTailwind };
