import { ComponentType, forwardRef } from 'react';
import { useBuildStyledComponent } from '../hooks/useBuildStyledComponent';

function styled<T, P extends keyof T>(Component: ComponentType<T>, styleClassProps?: P[]) {
  const Styled = forwardRef<unknown, any>(function StyledTW(props, ref) {
    return useBuildStyledComponent(props, Component, ref, styleClassProps);
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled;
}

export { styled };
