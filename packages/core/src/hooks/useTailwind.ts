import type { IRegisterComponentArgs } from '../types/store.types';
import { useComponentRegistration } from './useComponentRegistration';

function useTailwind(data: Omit<IRegisterComponentArgs, 'id'>) {
  const { component, hasInteractions, interactionStyles } = useComponentRegistration({
    inlineStyles: data.inlineStyles,
    className: data.className,
  });

  return {
    id: component.id,
    styles: component.styles,
    hasInteractions,
    interactionStyles,
  };
}

export { useTailwind };
