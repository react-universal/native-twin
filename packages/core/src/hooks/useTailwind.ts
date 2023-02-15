import type { IRegisterComponentArgs } from '../types/store.types';
import { useComponentRegistration } from './useComponentRegistration';

// import { useComponentStore } from './useComponentStore';

function useTailwind(data: Omit<IRegisterComponentArgs, 'id'>) {
  const { component, hasInteractions, interactionStyles } = useComponentRegistration({
    inlineStyles: data.inlineStyles,
    className: data.className,
  });
  // useComponentStore({
  //   id: component.id,
  //   inlineStyles: data.inlineStyles,
  //   className: data.className,
  // });

  return {
    id: component.id,
    styles: component.styles,
    hasInteractions,
    interactionStyles,
  };
}

export { useTailwind };
