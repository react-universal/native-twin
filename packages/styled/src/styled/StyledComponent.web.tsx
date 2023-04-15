import { ComponentType, forwardRef } from 'react';
import { useBuildStyledComponent } from '../hooks/useBuildStyledComponent.web';

function styled<T>(Component: ComponentType<T>) {
  const Styled = forwardRef<unknown, any>(function StyledTW(props, ref) {
    return useBuildStyledComponent(props, Component, ref);
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled;
}

export { styled };
