import { useEffect, useId, useMemo } from 'react';
import { tailwindStore } from '../store';
import type { IRegisteredComponent } from '../types/store.types';
import { useStore } from './useStore';

function useTailwind(className: string) {
  const id = useId();
  const storedComponent = useStore(
    (state) => state.components.find(([componentID]) => id === componentID)!,
  );
  const [, component] = useMemo(() => {
    if (storedComponent) return storedComponent;
    return [
      id,
      {
        className,
        styles: {},
        id: id,
        interactionStyles: [],
      },
    ];
  }, [id, storedComponent, className]);
  const componentPayload: IRegisteredComponent['1'] = useMemo(() => {
    return {
      id,
      interactionStyles: component?.interactionStyles ?? [],
      styles: component?.styles ?? {},
      className: component?.className,
    };
  }, [id, component?.className, component?.styles, component?.interactionStyles]);

  // const interactionProps = useInteraction(componentPayload);

  const styles = useMemo(() => {
    const baseStyles = componentPayload.styles;
    return baseStyles;
  }, [componentPayload.styles]);

  useEffect(() => {
    if (!storedComponent) {
      tailwindStore.registerComponent({
        id,
        className,
        inlineStyles: {},
      });
    }
    return () => {
      if (storedComponent) {
        tailwindStore.unregisterComponent(id);
      }
    };
  }, [id, className, storedComponent]);

  return {
    id,
    styles,
    hasInteractions: componentPayload.interactionStyles.length > 0,
    interactionStyles: componentPayload.interactionStyles,
  };
}

export { useTailwind };
