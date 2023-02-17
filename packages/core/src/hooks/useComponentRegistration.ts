import { useEffect, useId, useMemo } from 'react';
import type { IRegisterComponentArgs } from '../types/store.types';
import { useStore } from './useStore';

function useComponentRegistration(data: Omit<IRegisterComponentArgs, 'id'>) {
  const id = useId();
  const getComponent = useStore((state) => state.registerComponent);
  const unregisterComponent = useStore((state) => state.unregisterComponent);
  const [componentID, component] = useMemo(() => {
    return getComponent({
      id: id,
      inlineStyles: data.inlineStyles,
      className: data.className,
    });
  }, [id, data.inlineStyles, data.className, getComponent]);

  // const interactionProps = useInteraction(componentPayload);

  useEffect(() => {
    return () => {
      unregisterComponent(componentID);
    };
  }, [componentID, unregisterComponent]);

  return {
    component,
    hasInteractions: component.interactionStyles.length > 0,
    interactionStyles: component.interactionStyles,
  };
}

export { useComponentRegistration };
