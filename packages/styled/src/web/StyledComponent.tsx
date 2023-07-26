import { ComponentType, forwardRef } from 'react';
import { getComponentDisplayName } from '../utils/getComponentDisplayName';
import { useBuildStyledComponent } from './useBuildStyledComponent';

function styled<T>(Component: ComponentType<T>) {
  const Styled = forwardRef<unknown, any>(function StyledTW(props, ref) {
    return useBuildStyledComponent(props, Component, ref);
  });

  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${getComponentDisplayName(Component)}`;
  }
  return Styled;
}

export { styled };
