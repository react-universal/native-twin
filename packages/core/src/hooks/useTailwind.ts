import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { styleSheet, stylesStore } from '../modules';
import { parseClassNames } from '../utils/components.utils';

// import { useComponentStore } from './useComponentStore';

function useTailwind(classNames: string) {
  const parsed = useMemo(() => parseClassNames(classNames), [classNames]);
  const selector = useMemo(() => {
    const selector = styleSheet.prepareComponentStore(classNames);
    return selector;
  }, [classNames]);

  const getSnapshot = useCallback(() => {
    return stylesStore.getState().classNamesCollection.get(selector);
  }, [selector]);
  const styles = useSyncExternalStore(stylesStore.subscribe, getSnapshot, getSnapshot);
  return useMemo(
    () => ({
      parsed,
      normalStyles: styles?.normalStyles ?? {},
      hasInteractions: styles?.interactionStyles && styles?.interactionStyles?.length > 0,
      interactionStyles: styles?.interactionStyles ?? [],
    }),
    [styles, parsed],
  );
}

export { useTailwind };
