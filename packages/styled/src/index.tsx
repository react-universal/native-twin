import { ComponentType, forwardRef, useId, ComponentProps } from 'react';
import { useComponentRegistration, useInteraction } from './hooks';
import type { IExtraProperties } from './styled.types';

function styled<T extends ComponentType>(Component: T) {
  const Styled = forwardRef<T>(({ className = '', children, ...restProps }: any, ref) => {
    const componentID = useId();
    const { style } = useComponentRegistration(componentID, className, restProps?.style);
    const interaction = useInteraction(componentID, restProps);
    console.log('STYLE: ', style);
    return (
      <Component style={style} key={componentID} {...restProps} {...interaction} ref={ref}>
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
