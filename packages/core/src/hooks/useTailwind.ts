import type { IRegisterComponentArgs } from '../types/store.types';
import { useClassNamesTransform } from './useClassNamesTransform';

// import { useComponentStore } from './useComponentStore';

function useTailwind(data: Omit<IRegisterComponentArgs, 'id'>) {
  const { styles } = useClassNamesTransform(data.className ?? '');

  return {
    styles: styles.normalStyles,
    hasInteractions: styles.interactionStyles.length > 0,
    interactionStyles: styles.interactionStyles,
  };
}

export { useTailwind };
