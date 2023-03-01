import { useCallback, useId, useMemo } from 'react';
import { storeManager } from '../store/StoreManager';

function useStore(classNames: string) {
  const id = useId();
  const registerComponent = useCallback(() => {
    return storeManager.getState().registerComponent({
      id,
      inlineStyles: {},
      className: classNames,
    });
  }, [classNames, id]);
  const selector = useMemo(() => {
    const selector = registerComponent();
    return selector;
  }, [registerComponent]);

  const component = storeManager.useStore((state) => state.components[selector]);
  return component;
}

export { useStore };
