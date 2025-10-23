import { type ComponentType, forwardRef } from 'react';
import { useComponentInteractions } from '../hooks/useComponentInteractions';
import { useComponentRegistry } from '../hooks/useComponentRegistry';
import { useCssToRN } from '../hooks/useCssToRN';
import type { StyledComponentProps } from '../types/styled.types';

export type { StyledComponentProps };
export { useCssToRN, useComponentRegistry, useComponentInteractions };

export const _withStableStyles = (
  Component: ComponentType<any>,
  styleProvider: (injected: any, expressions: any[]) => Object,
) => {
  return forwardRef((props: any, ref) => {
    const { _expressions = [], __twinInjected, ...rest } = props;
    return (
      <Component
        ref={ref}
        style={styleProvider(__twinInjected, _expressions)}
        {...rest}
      />
    );
  });
};
