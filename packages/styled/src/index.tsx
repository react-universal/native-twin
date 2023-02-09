import { ComponentType, forwardRef, useId, ComponentProps } from 'react';
import { useComponentRegistration, useInteraction } from './hooks';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T>(({ className = '', children, ...restProps }: any, ref) => {
    const componentID = useId();
    const { style } = useComponentRegistration(componentID, className);
    const interaction = useInteraction(componentID, restProps);
    return (
      <Component key={componentID} {...restProps} {...interaction} ref={ref} style={style}>
        {children}
      </Component>
    );
  });
  if (typeof Component !== 'string') {
    Styled.displayName = `StyledTW.${Component.displayName || Component.name || 'NoName'}`;
  }
  return Styled as ComponentType<ComponentProps<typeof Component> & IExtraProperties>;
}

export { styled };
export { mergeTWClasses } from './utils/mergeClasses';
