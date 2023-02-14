import { useId } from 'react';
import type { IRegisterComponentArgs } from '../types/store.types';
import { useComponentRegistration } from './useComponentRegistration';

function useTailwind(data: Omit<IRegisterComponentArgs, 'id'>) {
  const id = useId();
  const { component, hasInteractions, interactionStyles } = useComponentRegistration({
    id,
    inlineStyles: data.inlineStyles,
    className: data.className,
  });

  return {
    id,
    styles: component.styles,
    hasInteractions,
    interactionStyles,
  };
}

export { useTailwind };
